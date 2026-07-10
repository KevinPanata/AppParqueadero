import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VehiqlosModule } from './vehiqlos/vehiqlos.module';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    VehiqlosModule,
  ],
})
export class AppModule {}