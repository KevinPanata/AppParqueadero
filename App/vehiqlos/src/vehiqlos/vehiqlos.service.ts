import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehiculoDto } from './dto/create-vehiqlo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiqlo.dto';
import { Vehiculo } from './entities/vehiqlo.entity';
import { FactoryVehiculo } from './factory/factory-vehiqlo';
import { AuditEvent, EventPublisher } from 'src/common/event-publisher.service';

export interface AuditContext {
  usuario?: string;
  idPersona?: string;
  ip: string;
  mac: string;
}

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly repositoryVehiculo: Repository<Vehiculo>,
    private readonly eventPublisher: EventPublisher,
  ) {}

  private async emitEvent(
    accion: string,
    vehiculo: Vehiculo,
    auditContext: AuditContext,
    datosExtra?: any,
  ) {
    const event: AuditEvent = {
      servicio: 'ms-vehiculos',
      accion,
      entidad: 'VEHICULO',
      usuario: auditContext.usuario,
      idPersona: auditContext.idPersona,
      ip: auditContext.ip,
      mac: auditContext.mac,
      datos: {
        idVehiculo: vehiculo.id,
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        color: vehiculo.color,
        anio: vehiculo.anio,
        clasificacion: vehiculo.clasificacion,
        tipoVehiculo: vehiculo.obtenerTipo(),
        ...datosExtra,
      },
    };

    await this.eventPublisher.publish(event);
  }

  async create(
    dto: CreateVehiculoDto,
    auditContext: AuditContext,
  ): Promise<Vehiculo> {
    this.normalizarDatos(dto.datos);

    const existe = await this.repositoryVehiculo.findOne({
      where: { placa: dto.datos.placa },
    });

    if (existe) {
      throw new ConflictException('Ya existe un vehículo con esa placa');
    }

    const vehiculo = FactoryVehiculo.crear(dto);

    const saved = await this.repositoryVehiculo.save(vehiculo);

    await this.emitEvent('CREATE', saved, auditContext, {
      mensaje: 'Vehículo creado correctamente',
    });

    return saved;
  }

  async findAll(): Promise<Vehiculo[]> {
    return this.repositoryVehiculo.find();
  }

  async findOne(id: string): Promise<Vehiculo> {
    const vehiculo = await this.repositoryVehiculo.findOne({
      where: { id },
    });

    if (!vehiculo) {
      throw new NotFoundException('No existe un vehículo con ese id');
    }

    return vehiculo;
  }

  async findByPlaca(placa: string): Promise<Vehiculo> {
    const placaNormalizada = placa.trim().toUpperCase();

    const vehiculo = await this.repositoryVehiculo.findOne({
      where: { placa: placaNormalizada },
    });

    if (!vehiculo) {
      throw new NotFoundException('No existe un vehículo con esa placa');
    }

    return vehiculo;
  }

  async update(
    id: string,
    dto: UpdateVehiculoDto,
    auditContext: AuditContext,
  ): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);

    if (dto.datos) {
      this.normalizarDatos(dto.datos);

      if (dto.datos.placa && dto.datos.placa !== vehiculo.placa) {
        const existePlaca = await this.repositoryVehiculo.findOne({
          where: { placa: dto.datos.placa },
        });

        if (existePlaca) {
          throw new ConflictException('Ya existe un vehículo con esa placa');
        }
      }

      Object.assign(vehiculo, dto.datos);
    }

    const updated = await this.repositoryVehiculo.save(vehiculo);

    await this.emitEvent('UPDATE', updated, auditContext, {
      mensaje: 'Vehículo actualizado correctamente',
      cambios: dto.datos,
    });

    return updated;
  }

  async remove(
    id: string,
    auditContext: AuditContext,
  ): Promise<void> {
    const vehiculo = await this.findOne(id);

    await this.repositoryVehiculo.delete(vehiculo.id);

    await this.emitEvent('DELETE', vehiculo, auditContext, {
      mensaje: 'Vehículo eliminado correctamente',
    });
  }

  private normalizarDatos(datos: any): void {
    if (datos.placa) datos.placa = datos.placa.trim().toUpperCase();
    if (datos.marca) datos.marca = datos.marca.trim().toUpperCase();
    if (datos.modelo) datos.modelo = datos.modelo.trim().toUpperCase();
    if (datos.color) datos.color = datos.color.trim().toUpperCase();
    if (datos.cabina) datos.cabina = datos.cabina.trim().toUpperCase();
  }
}