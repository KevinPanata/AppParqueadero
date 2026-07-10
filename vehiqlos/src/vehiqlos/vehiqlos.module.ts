import { Module } from '@nestjs/common';
import { VehiqlosService } from './vehiqlos.service';
import { VehiqlosController } from './vehiqlos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiqlo } from './entities/vehiqlo.entity';
import { Auto } from './entities/auto.entity';
import { Moto } from './entities/moto.entity';
import { Camioneta } from './entities/camioneta.entity';
import { EventPublisher } from 'src/common/event-publisher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiqlo, Auto, Moto, Camioneta])],
  controllers: [VehiqlosController],
  providers: [VehiqlosService, EventPublisher],
  exports: [VehiqlosService],
})
export class VehiqlosModule {}