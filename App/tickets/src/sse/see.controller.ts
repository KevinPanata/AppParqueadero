// src/sse/sse.controller.ts
import { Controller, Sse, UseGuards } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { SseService, SseEvent } from './sse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('sse')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SseController {
    constructor(private readonly sseService: SseService) {}

    /**
     * Stream de eventos de espacios
     */
    @Sse('espacios')
    @Roles(Role.ADMIN, Role.CLIENTE)
    streamEspacios(): Observable<MessageEvent> {
        return this.sseService.getEventStream().pipe(
            map((event: SseEvent) => ({
                data: JSON.stringify({
                    ...event.data,
                    _eventType: event.type,
                    _timestamp: event.timestamp
                }),
                type: event.type,
                id: event.timestamp || Date.now().toString(),
            }))
        );
    }

    /**
     * Stream de eventos de tickets
     */
    @Sse('tickets')
    @Roles(Role.ADMIN, Role.CLIENTE)
    streamTickets(): Observable<MessageEvent> {
        return this.sseService.getEventStream().pipe(
            map((event: SseEvent) => ({
                data: JSON.stringify({
                    ...event.data,
                    _eventType: event.type,
                    _timestamp: event.timestamp
                }),
                type: event.type,
                id: event.timestamp || Date.now().toString(),
            }))
        );
    }

    /**
     * Stream de eventos de estadísticas
     */
    @Sse('estadisticas')
    @Roles(Role.ADMIN)
    streamEstadisticas(): Observable<MessageEvent> {
        return this.sseService.getEventStream().pipe(
            map((event: SseEvent) => ({
                data: JSON.stringify({
                    ...event.data,
                    _eventType: event.type,
                    _timestamp: event.timestamp
                }),
                type: event.type,
                id: event.timestamp || Date.now().toString(),
            }))
        );
    }

    /**
     * Stream de alertas
     */
    @Sse('alertas')
    @Roles(Role.ADMIN)
    streamAlertas(): Observable<MessageEvent> {
        return this.sseService.getEventStream().pipe(
            map((event: SseEvent) => ({
                data: JSON.stringify({
                    ...event.data,
                    _eventType: event.type,
                    _timestamp: event.timestamp
                }),
                type: event.type,
                id: event.timestamp || Date.now().toString(),
            }))
        );
    }

    /**
     * Stream general (todos los eventos)
     */
    @Sse('stream')
    @Roles(Role.ADMIN)
    streamAll(): Observable<MessageEvent> {
        return this.sseService.getEventStream().pipe(
            map((event: SseEvent) => ({
                data: JSON.stringify({
                    ...event.data,
                    _eventType: event.type,
                    _timestamp: event.timestamp
                }),
                type: event.type,
                id: event.timestamp || Date.now().toString(),
            }))
        );
    }
}