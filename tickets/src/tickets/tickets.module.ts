import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { HttpClientService } from './common/httpl-client.service';
import { EventPublisher } from '../common/event-publisher.service';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), SseModule],
  controllers: [TicketsController],
  providers: [TicketsService, HttpClientService, EventPublisher],
})
export class TicketsModule {}
