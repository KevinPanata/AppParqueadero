import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Vehiculo } from '../vehiqlos/entities/vehiqlo.entity';
import { Auto } from '../vehiqlos/entities/auto.entity';
import { Moto } from '../vehiqlos/entities/moto.entity';
import { Camioneta } from '../vehiqlos/entities/camioneta.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'vehiculos_db',
  entities: [Vehiculo, Auto, Moto, Camioneta],
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
};
