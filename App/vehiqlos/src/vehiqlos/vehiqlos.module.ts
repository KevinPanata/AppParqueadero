import { Module } from '@nestjs/common';
import { VehiculosService } from './vehiqlos.service';
import { VehiculosController } from './vehiqlos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from './entities/vehiqlo.entity';
import { Auto } from './entities/auto.entity';
import { Moto } from './entities/moto.entity';
import { Camioneta } from './entities/camioneta.entity';
import { EventPublisher } from 'src/common/event-publisher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, Auto, Moto, Camioneta])],
  controllers: [VehiculosController],
  providers: [VehiculosService, EventPublisher],
  exports: [VehiculosService],
})
export class VehiculosModule {}