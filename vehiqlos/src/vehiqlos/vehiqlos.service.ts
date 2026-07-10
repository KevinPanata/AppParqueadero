import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateVehiqloDto } from './dto/create-vehiqlo.dto';
import { UpdateVehiqloDto } from './dto/update-vehiqlo.dto';
import { Vehiqlo } from './entities/vehiqlo.entity';
import { Repository } from 'typeorm';
import { FactoryVehiqlo } from './factory/factory-vehiqlo';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditEvent, EventPublisher } from 'src/common/event-publisher.service';

@Injectable()
export class VehiqlosService {

  constructor(
    @InjectRepository(Vehiqlo)
    private repositoryVehiqlo: Repository<Vehiqlo>,
    private eventPublisher: EventPublisher,
  ){}

  

  async create(createVehiqloDto: CreateVehiqloDto): Promise<Vehiqlo> {
    const existe = await this.repositoryVehiqlo.findOne({
      where: {placa: createVehiqloDto.datos.placa},});
    
    if(existe){
      throw new ConflictException(`Ya existe un vehículo registrado con la placa: ${createVehiqloDto.datos.placa}`);
    }

    const vehiqlo = FactoryVehiqlo.crear(createVehiqloDto);
    const saved = await this.repositoryVehiqlo.save(vehiqlo);
    await this.emitEvent('CREATE', saved);
    return saved;
  }

  async findAll():Promise<Vehiqlo[]> {
    return this.repositoryVehiqlo.find();
    
  }

  async findOne(id: string):Promise<Vehiqlo> {
    const vehiqlo = await this.repositoryVehiqlo.findOne({where:{id}});
    if(!vehiqlo){
      throw new NotFoundException(`No existe un vehículo registrado con el ID: ${id}`);
    }
    return vehiqlo;
  }

  async update(id: string, updateVehiqloDto: UpdateVehiqloDto):Promise<any> {
    const existe = await this.repositoryVehiqlo.findOne({where:{id}});
    if(!existe){
      throw new NotFoundException(`No existe un vehículo registrado con el ID: ${id}`);
    }

    if(updateVehiqloDto?.datos?.placa != existe.placa){
      const existePlaca = await this.repositoryVehiqlo.findOne({where:{placa: updateVehiqloDto?.datos?.placa}});
      if(existePlaca){
        throw new ConflictException(`Ya existe un vehículo registrado con la placa: ${updateVehiqloDto?.datos?.placa}`);
      }
    }

    const vehiqlo = FactoryVehiqlo.crear(updateVehiqloDto as CreateVehiqloDto);
    const saved = await this.repositoryVehiqlo.update(id, vehiqlo);
    await this.emitEvent('UPDATE', saved);
    return saved;
    
  }

  async remove(id: string):Promise<void> {
    const existe = await this.repositoryVehiqlo.findOne({where:{id}});
    if(!existe){
      throw new NotFoundException(`No existe un vehículo registrado con el ID: ${id}`);
    }
    await this.repositoryVehiqlo.delete(id);
    await this.emitEvent('DELETE', existe);
  }

  // Método auxiliar para publicar eventos
  private async emitEvent(accion: string, vehiqlo: any) {
    const event: AuditEvent = {
      servicio: 'vehiqlos',
      accion,
      entidad: 'Vehiqlo',
      datos: { ...vehiqlo },
    };
    await this.eventPublisher.publishEvent(event);
  }
}
