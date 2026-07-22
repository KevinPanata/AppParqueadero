import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { HttpClientService } from './common/httpl-client.service';
import { EventPublisher } from '../common/event-publisher.service';
import { SseModule } from '../sse/sse.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), SseModule, CacheModule],
  controllers: [TicketsController],
  providers: [TicketsService, HttpClientService, EventPublisher],
})
export class TicketsModule {}
