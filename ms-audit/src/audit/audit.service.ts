import { Injectable } from '@nestjs/common';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventoAuditoria } from './entities/evento-auditoria.entity';

@Injectable()
export class AuditService {

  constructor(
    @InjectRepository(EventoAuditoria)
    private auditRepo: Repository<EventoAuditoria>,
  ) { }

  async create(dto: CreateAuditEventDto): Promise<EventoAuditoria> {
    const newEvent = this.auditRepo.create({
      servicio: dto.servicio,
      accion: dto.action,
      entidad: dto.entidad,
      datos: dto.datos,
      usuario: dto.usuario || 'system',
      ip: dto.ip,
      mac: dto.mac,
      timestamp: new Date(),
    });
    return this.auditRepo.save(newEvent);
  }

  async findAll(): Promise<EventoAuditoria[]> {
    return this.auditRepo.find({ order: { timestamp: 'DESC' } });
  }

  async findOne(id: string): Promise<EventoAuditoria | null> {
    return this.auditRepo.findOne({ where: { id } });
  }

}