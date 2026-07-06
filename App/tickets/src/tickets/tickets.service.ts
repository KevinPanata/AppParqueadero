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
  ) {
    this.usuariosUrl = this.configService.get<string>('USUARIOS_URL')!;
    this.espacioUrl = this.configService.get<string>('ZONAS_URL')!;
    this.vehiculoUrl = this.configService.get<string>('VEHICULOS_URL')!;
    this.tarifaPorHora = Number(
      this.configService.get<string>('TARIFA_POR_HORA', '1.5'),
    );
  }

  async create(dto: CreateTicketDto, token: string): Promise<Ticket> {
    const placa = dto.placa.trim().toUpperCase();
    const dni = dto.dni.trim();

    const usuario = await this.validarUsuarioPorDni(dni,token);
    if (!usuario) {
      throw new BadRequestException(`No se encontró un usuario con DNI ${dni}`);
    }

    const vehiculo = await this.validarPlaca(placa, token);
    if (!vehiculo) {
      throw new BadRequestException(`No se encontró un vehículo con placa ${placa}`);
    }

    const espacio = await this.validarEspacioDisponible(dto.idEspacio, dto.idZona, token);
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

    return ticketGuardado;
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      order: { fechaHoraIngreso: 'DESC' },
    });
  }

  async findActivos(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { activo: true },
      order: { fechaHoraIngreso: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new BadRequestException(`No se encontró un ticket con ID ${id}`);
    }

    return ticket;
  }

  async cerrarTicket(id: string, dto: UpdateTicketDto, token: string,): Promise<Ticket> {
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

    return this.ticketRepository.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);

    if (ticket.activo) {
      throw new BadRequestException('No se puede eliminar un ticket activo');
    }

    await this.ticketRepository.delete(id);
  }

  private async validarUsuarioPorDni(dni: string, token: string): Promise<Usuario | null> {
    try {
      const url = `${this.usuariosUrl}/dni/${dni}`;
      return await this.httpClient.get<Usuario>(url, token);
    } catch (error) {
      this.logger.error(`Error al validar usuario con DNI ${dni}: ${error}`);
      return null;
    }
  }

  private async validarPlaca(placa: string, token: string): Promise<Vehiculo | null> {
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
      token
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