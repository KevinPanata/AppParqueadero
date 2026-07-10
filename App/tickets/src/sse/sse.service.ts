// src/sse/sse.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface SseEvent {
    type: string;
    data: any;
    timestamp?: string;
}

@Injectable()
export class SseService {
    private readonly logger = new Logger(SseService.name);
    private eventSubject = new Subject<SseEvent>();

    /**
     * Emitir un evento SSE
     */
    emitEvent(type: string, data: any): void {
        const event: SseEvent = {
            type,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.logger.log(`📡 Emitiendo evento SSE: ${type}`);
        this.eventSubject.next(event);
    }

    /**
     * Obtener el stream de eventos
     */
    getEventStream(): Observable<SseEvent> {
        return this.eventSubject.asObservable();
    }

    /**
     * Emitir evento específico de ticket creado
     */
    emitTicketCreated(ticket: any): void {
        this.emitEvent('ticket_created', ticket);
    }

    /**
     * Emitir evento de ticket actualizado
     */
    emitTicketUpdated(ticket: any): void {
        this.emitEvent('ticket_updated', ticket);
    }

    /**
     * Emitir evento de ticket eliminado
     */
    emitTicketDeleted(ticketId: string): void {
        this.emitEvent('ticket_deleted', { id: ticketId });
    }

    /**
     * Emitir evento de estado de ticket cambiado
     */
    emitTicketStatusChanged(ticket: any, oldStatus: string, newStatus: string): void {
        this.emitEvent('ticket_status_changed', {
            ticket,
            oldStatus,
            newStatus
        });
    }

    /**
     * Emitir evento de espacio ocupado/liberado
     */
    emitSpaceStatusChanged(spaceId: string, status: string): void {
        this.emitEvent('space_status_changed', {
            spaceId,
            status,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Emitir evento de estadísticas actualizadas
     */
    emitStatisticsUpdated(stats: any): void {
        this.emitEvent('statistics_updated', stats);
    }

    /**
     * Emitir evento de alerta
     */
    emitAlert(message: string, level: 'info' | 'warning' | 'error'): void {
        this.emitEvent('alert', {
            message,
            level,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Cerrar conexión (limpiar recursos)
     */
    close(): void {
        this.eventSubject.complete();
        this.logger.log('SSE Service cerrado');
    }
}