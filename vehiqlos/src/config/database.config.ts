import * as dotenv from 'dotenv';
dotenv.config();

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Vehiqlo } from '../vehiqlos/entities/vehiqlo.entity';
import { Auto } from '../vehiqlos/entities/auto.entity';
import { Moto } from '../vehiqlos/entities/moto.entity';
import { Camioneta } from '../vehiqlos/entities/camioneta.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) ?? 5432,
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '1234',
  database: process.env.DB_NAME ?? 'vehiqlosdb',
  entities: [Vehiqlo, Auto, Moto, Camioneta],
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
};
