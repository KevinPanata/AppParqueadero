import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventPublisher } from '../common/event-publisher.service';
import { SseService } from '../sse/sse.service';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly personaUrl: string;
  private readonly espacioUrl: string;
  private readonly vehiculosUrl: string;
  private readonly tarifaPorHora: number;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly sseService: SseService,
    private readonly configService: ConfigService,
    private readonly eventPublisher: EventPublisher,
  ) {
    this.personaUrl = this.configService.get<string>('MS_PERSONA') || 'http://localhost:8080/api/users';
    this.espacioUrl = this.configService.get<string>('MS_ESPACIOS') || 'http://localhost:8081/api/espacios';
    this.vehiculosUrl = this.configService.get<string>('MS_VEHICULOS') || 'http://localhost:3000/vehiqlos';
    this.tarifaPorHora = this.configService.get<number>('TARIFA_HORA') || 1;
  }

  async create(createTicketDto: CreateTicketDto, authHeader: string): Promise<Ticket> {
    const headers = { 'Authorization': authHeader, 'Content-Type': 'application/json' };

    // 1. Verificar Espacio en zonas-espacios
    let espacioData: any;
    try {
      const res = await fetch(`${this.espacioUrl}/${createTicketDto.idEspacio}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      espacioData = await res.json();
    } catch (error: any) {
      throw new NotFoundException(`El espacio con ID ${createTicketDto.idEspacio} no existe o no hay acceso: ${error.message}`);
    }

    if (espacioData.estado !== 'DISPONIBLE') {
      throw new BadRequestException(`El espacio ${espacioData.nombre} no está disponible`);
    }

    // 2. Verificar Vehículo en vehiqlos
    let vehiculoExiste = false;
    try {
      const res = await fetch(this.vehiculosUrl, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const vehiculos: any[] = await res.json();
      vehiculoExiste = vehiculos.some(v => v.placa === createTicketDto.placa);
    } catch (error: any) {
      throw new BadRequestException(`No se pudo conectar con el servicio de vehículos: ${error.message}`);
    }

    if (!vehiculoExiste) {
      throw new NotFoundException(`El vehículo con placa ${createTicketDto.placa} no está registrado`);
    }

    // 3. Verificar Usuario en usuarios (DNI)
    let usuarioExiste = false;
    try {
      const res = await fetch(this.personaUrl, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const usuarios: any[] = await res.json();
      usuarioExiste = usuarios.some(u => u.person && u.person.dni === createTicketDto.dni);
    } catch (error: any) {
      throw new BadRequestException(`No se pudo conectar con el servicio de usuarios: ${error.message}`);
    }

    if (!usuarioExiste) {
      throw new NotFoundException(`El usuario con DNI ${createTicketDto.dni} no está registrado`);
    }

    // 4. Crear Ticket
    const ticket = this.ticketRepository.create({
      placa: createTicketDto.placa,
      dni: createTicketDto.dni,
      idEspacio: createTicketDto.idEspacio,
      nombreZona: espacioData.nombreZona || 'Sin Zona',
      fechaHoraIngreso: new Date(),
      activo: true,
      valorRecaudado: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // 5. Ocupar el espacio (PATCH)
    try {
      await fetch(`${this.espacioUrl}/${createTicketDto.idEspacio}/estado?nuevoEstado=OCUPADO`, {
        method: 'PATCH',
        headers
      });
      this.sseService.emitEvent('espacio-actualizado', {
        idEspacio: createTicketDto.idEspacio,
        estado: 'OCUPADO',
      });
    } catch (error: any) {
      this.logger.error(`Error al enviar PATCH para ocupar espacio: ${error.message}`);
    }

    await this.emitEvent('CREATE', savedTicket);
    return savedTicket;
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }
    return ticket;
  }

  async findActivos(){
    return this.ticketRepository.find({where: {activo: true}, order: {fechaHoraIngreso: 'DESC'}});
  }

  async cerrarTicket(id: string, updateTicketDto: UpdateTicketDto, authHeader: string): Promise<Ticket> {
    const ticket = await this.findOne(id);
    const headers = { 'Authorization': authHeader, 'Content-Type': 'application/json' };

    // Si el ticket se está desactivando (marcando salida)
    if (updateTicketDto.activo === false && ticket.activo) {
      const fechaHoraSalida = new Date();
      const horas = this.calcularHoras(ticket.fechaHoraIngreso, fechaHoraSalida);
      const costo = horas * this.tarifaPorHora;

      ticket.activo = false;
      ticket.fechaHoraSalida = fechaHoraSalida;
      ticket.valorRecaudado = updateTicketDto.valorRecaudado || costo;

      // Actualizar el estado del espacio (PATCH)
      try {
        await fetch(`${this.espacioUrl}/${ticket.idEspacio}/estado?nuevoEstado=DISPONIBLE`, {
          method: 'PATCH',
          headers
        });
        this.sseService.emitEvent('espacio-actualizado', {
          idEspacio: ticket.idEspacio,
          estado: 'DISPONIBLE',
        });
      } catch(error: any) {
        this.logger.error(`Error al enviar PATCH para liberar espacio: ${error.message}`);
      }
      
      const closedTicket = await this.ticketRepository.save(ticket);
      this.logger.log(`Ticket ${id} cerrado exitosamente`); 
      await this.emitEvent('UPDATE', closedTicket);
      return closedTicket;
    }

    if (updateTicketDto.placa !== undefined) ticket.placa = updateTicketDto.placa;
    if (updateTicketDto.dni !== undefined) ticket.dni = updateTicketDto.dni;
    if (updateTicketDto.idEspacio !== undefined) ticket.idEspacio = updateTicketDto.idEspacio;
    if (updateTicketDto.valorRecaudado !== undefined) ticket.valorRecaudado = updateTicketDto.valorRecaudado;

    ticket.updatedAt = new Date();
    const updatedTicket = await this.ticketRepository.save(ticket);
    await this.emitEvent('UPDATE', updatedTicket);
    return updatedTicket;
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
    await this.emitEvent('DELETE', ticket);
  }

  private calcularHoras(ingreso:Date, salida:Date):number {
    const diffMs = salida.getTime() - ingreso.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.ceil(diffHours);
  }

  private async emitEvent(accion: string, ticket: any) {
    const event = {
      servicio: 'tickets',
      accion,
      entidad: 'Ticket',
      datos: { ...ticket },
    };
    await this.eventPublisher.publishEvent(event);
  }
}