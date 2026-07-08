import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpClientService } from './common/http-client.service';
import { EventPublisher } from './common/event-publisher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketsController],
  providers: [TicketsService, HttpClientService, EventPublisher],
})
export class TicketsModule {}