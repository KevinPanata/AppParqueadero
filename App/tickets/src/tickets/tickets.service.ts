import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { HttpClientService } from './common/http-client.service';
import { Vehiculo } from './interfaces/vehiculo.interface';
import { Espacio } from './interfaces/espacio.interface';
import { Usuario } from './interfaces/usuario.interface';
import { EventPublisher } from './common/event-publisher.service';

export interface AuditContext {
  usuario?: string;
  idPersona?: string;
  ip: string;
  mac: string;
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly usuariosUrl: string;
  private readonly espacioUrl: string;
  private readonly vehiculoUrl: string;
  private readonly tarifaPorHora: number;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly httpClient: HttpClientService,
    private readonly configService: ConfigService,
    private readonly eventPublisher: EventPublisher,
  ) {
    this.usuariosUrl = this.configService.get<string>('USUARIOS_URL')!;
    this.espacioUrl = this.configService.get<string>('ZONAS_URL')!;
    this.vehiculoUrl = this.configService.get<string>('VEHICULOS_URL')!;
    this.tarifaPorHora = Number(
      this.configService.get<string>('TARIFA_POR_HORA', '1.5'),
    );
  }

  private async emitEvent(
    accion: string,
    ticket: Ticket,
    auditContext: AuditContext,
    datosExtra?: Record<string, unknown>,
  ): Promise<void> {
    await this.eventPublisher.publish({
      servicio: 'ms-tickets',
      accion,
      entidad: 'TICKET',
      usuario: auditContext.usuario,
      idPersona: auditContext.idPersona,
      ip: auditContext.ip,
      mac: auditContext.mac,
      datos: {
        idTicket: ticket.id,
        placa: ticket.placa,
        dni: ticket.dni,
        idEspacio: ticket.idEspacio,
        idZona: ticket.idZona,
        nombreZona: ticket.nombreZona,
        fechaHoraIngreso: ticket.fechaHoraIngreso,
        fechaHoraSalida: ticket.fechaHoraSalida,
        activo: ticket.activo,
        valorRecaudado: ticket.valorRecaudado,
        ...(datosExtra ?? {}),
      },
    });
  }

  async create(
    dto: CreateTicketDto,
    token: string,
    auditContext: AuditContext,
  ): Promise<Ticket> {
    const placa = dto.placa.trim().toUpperCase();
    const dni = dto.dni.trim();

    const usuario = await this.validarUsuarioPorDni(dni, token);

    if (!usuario) {
      throw new BadRequestException(`No se encontró un usuario con DNI ${dni}`);
    }

    const vehiculo = await this.validarPlaca(placa, token);

    if (!vehiculo) {
      throw new BadRequestException(
        `No se encontró un vehículo con placa ${placa}`,
      );
    }

    const espacio = await this.validarEspacioDisponible(
      dto.idEspacio,
      dto.idZona,
      token,
    );

    if (!espacio) {
      throw new BadRequestException(
        `El espacio ${dto.idEspacio} no está disponible en la zona ${dto.idZona}`,
      );
    }

    await this.validarTicketActivo(placa);

    const ticket = this.ticketRepository.create({
      placa,
      dni,
      idEspacio: espacio.id,
      idZona: espacio.idZona,
      nombreZona: espacio.nombreZona,
      fechaHoraIngreso: new Date(),
      activo: true,
      valorRecaudado: 0,
    });

    const ticketGuardado = await this.ticketRepository.save(ticket);

    await this.cambiarEstadoEspacio(espacio.id, 'OCUPADO', token);

    await this.emitEvent('CREATE', ticketGuardado, auditContext, {
      mensaje: 'Ticket creado correctamente',
      usuarioValidado: {
        idUsuario: usuario.id,
        username: usuario.username,
        dni: usuario.person.dni,
        nombres: `${usuario.person.firstName} ${usuario.person.lastName}`,
      },
      vehiculoValidado: {
        idVehiculo: vehiculo.id,
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        color: vehiculo.color,
      },
      espacioActualizado: {
        idEspacio: espacio.id,
        estadoAnterior: 'DISPONIBLE',
        estadoNuevo: 'OCUPADO',
      },
    });

    return ticketGuardado;
  }

  async findAll(auditContext: AuditContext): Promise<Ticket[]> {
    const tickets = await this.ticketRepository.find({
      order: { fechaHoraIngreso: 'DESC' },
    });

    await this.eventPublisher.publish({
      servicio: 'ms-tickets',
      accion: 'SELECT',
      entidad: 'TICKET',
      usuario: auditContext.usuario,
      idPersona: auditContext.idPersona,
      ip: auditContext.ip,
      mac: auditContext.mac,
      datos: {
        mensaje: 'Consulta general de tickets',
        cantidadRegistros: tickets.length,
      },
    });

    return tickets;
  }

  async findActivos(auditContext: AuditContext): Promise<Ticket[]> {
    const tickets = await this.ticketRepository.find({
      where: { activo: true },
      order: { fechaHoraIngreso: 'DESC' },
    });

    await this.eventPublisher.publish({
      servicio: 'ms-tickets',
      accion: 'SELECT',
      entidad: 'TICKET',
      usuario: auditContext.usuario,
      idPersona: auditContext.idPersona,
      ip: auditContext.ip,
      mac: auditContext.mac,
      datos: {
        mensaje: 'Consulta de tickets activos',
        cantidadRegistros: tickets.length,
      },
    });

    return tickets;
  }

  async findOne(id: string, auditContext?: AuditContext): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new BadRequestException(`No se encontró un ticket con ID ${id}`);
    }

    if (auditContext) {
      await this.emitEvent('SELECT', ticket, auditContext, {
        mensaje: 'Consulta de ticket por ID',
        idConsultado: id,
      });
    }

    return ticket;
  }

  async cerrarTicket(
    id: string,
    dto: UpdateTicketDto,
    token: string,
    auditContext: AuditContext,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (!ticket.activo) {
      throw new BadRequestException(`El ticket con ID ${id} ya está cerrado`);
    }

    const fechaSalida = new Date();
    const horas = this.calcularHoras(ticket.fechaHoraIngreso, fechaSalida);
    const costo = horas * this.tarifaPorHora;

    ticket.activo = false;
    ticket.fechaHoraSalida = fechaSalida;
    ticket.valorRecaudado = dto.valorRecaudado ?? costo;

    await this.cambiarEstadoEspacio(ticket.idEspacio, 'DISPONIBLE', token);

    const ticketCerrado = await this.ticketRepository.save(ticket);

    await this.emitEvent('UPDATE', ticketCerrado, auditContext, {
      mensaje: 'Ticket cerrado correctamente',
      accionRealizada: 'CIERRE_TICKET',
      tiempoHoras: horas,
      tarifaPorHora: this.tarifaPorHora,
      costoCalculado: costo,
      valorRecaudado: ticketCerrado.valorRecaudado,
      espacioActualizado: {
        idEspacio: ticket.idEspacio,
        estadoAnterior: 'OCUPADO',
        estadoNuevo: 'DISPONIBLE',
      },
    });

    return ticketCerrado;
  }

  async remove(id: string, auditContext: AuditContext): Promise<void> {
    const ticket = await this.findOne(id);

    if (ticket.activo) {
      throw new BadRequestException('No se puede eliminar un ticket activo');
    }

    await this.ticketRepository.delete(id);

    await this.emitEvent('DELETE', ticket, auditContext, {
      mensaje: 'Ticket eliminado correctamente',
    });
  }

  private async validarUsuarioPorDni(
    dni: string,
    token: string,
  ): Promise<Usuario | null> {
    try {
      const url = `${this.usuariosUrl}/dni/${dni}`;
      return await this.httpClient.get<Usuario>(url, token);
    } catch (error) {
      this.logger.error(`Error al validar usuario con DNI ${dni}: ${error}`);
      return null;
    }
  }

  private async validarPlaca(
    placa: string,
    token: string,
  ): Promise<Vehiculo | null> {
    try {
      const url = `${this.vehiculoUrl}/placa/${placa}`;
      return await this.httpClient.get<Vehiculo>(url, token);
    } catch (error) {
      this.logger.error(`Error al validar placa ${placa}: ${error}`);
      return null;
    }
  }

  private async validarEspacioDisponible(
    idEspacio: string,
    idZona: string,
    token: string,
  ): Promise<Espacio | null> {
    try {
      const url = `${this.espacioUrl}/${idEspacio}`;
      const espacio = await this.httpClient.get<Espacio>(url, token);

      if (
        espacio.id === idEspacio &&
        espacio.idZona === idZona &&
        espacio.estado === 'DISPONIBLE' &&
        espacio.activo
      ) {
        return espacio;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error al validar espacio disponible: ${error}`);
      return null;
    }
  }

  private async cambiarEstadoEspacio(
    idEspacio: string,
    nuevoEstado: 'DISPONIBLE' | 'OCUPADO',
    token: string,
  ): Promise<void> {
    const url = `${this.espacioUrl}/${idEspacio}/estado`;

    await this.httpClient.patch<void>(
      url,
      {
        nuevoEstado,
      },
      token,
    );
  }

  private async validarTicketActivo(placa: string): Promise<void> {
    const ticketActivo = await this.ticketRepository.findOne({
      where: { placa, activo: true },
    });

    if (ticketActivo) {
      throw new BadRequestException(
        `El vehículo con placa ${placa} ya tiene un ticket activo.`,
      );
    }
  }

  private calcularHoras(ingreso: Date, salida: Date): number {
    const diffMs = salida.getTime() - ingreso.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);
    return Math.max(1, Math.ceil(diffHoras));
  }
}