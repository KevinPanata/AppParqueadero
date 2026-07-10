// src/tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { HttpClientService } from './common/http-client.service';
import { EventPublisher } from './common/event-publisher.service';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    ConfigModule,
    SseModule, // ✅ Importar SseModule
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    HttpClientService,
    EventPublisher,
  ],
  exports: [TicketsService],
})
export class TicketsModule {}