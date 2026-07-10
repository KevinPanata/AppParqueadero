// src/tickets/common/event-publisher.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export interface AuditEvent {
  servicio: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  datos?: any;
  usuario?: string;
  ip?: string;
  mac?: string;
}

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPublisher.name);
  private connection: any = null;
  private channel: any = null;
  private isConnected: boolean = false;
  private exchangeName: string;
  private routingKey: string;

  constructor(private configService: ConfigService) {
    this.exchangeName = this.configService.get<string>('RABBITMQ_EXCHANGE', 'exchange_audit');
    this.routingKey = this.configService.get<string>('RABBITMQ_ROUTING_KEY', 'routing_audit');
  }

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
      const port = this.configService.get<number>('RABBITMQ_PORT', 5672);
      const user = this.configService.get<string>('RABBITMQ_USER', 'admin');
      const pass = this.configService.get<string>('RABBITMQ_PASSWORD', 'admin123');
      const url = `amqp://${user}:${pass}@${host}:${port}`;

      this.logger.log(`Intentando conectar a RabbitMQ en ${host}:${port}...`);
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.isConnected = true;

      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      this.logger.log(`✅ Conectado a RabbitMQ en ${url}`);

      this.connection.on('close', () => {
        this.logger.warn('Conexión con RabbitMQ cerrada. Intentando reconectar...');
        this.isConnected = false;
        this.connection = null;
        this.channel = null;
        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on('error', (error: Error) => {
        this.logger.error(`Error en conexión RabbitMQ: ${error.message}`);
        this.isConnected = false;
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Falló conexión a RabbitMQ: ${errorMessage}`);
      this.isConnected = false;
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publishEvent(event: AuditEvent): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      this.logger.warn('RabbitMQ no está conectado. Evento no publicado.');
      return false;
    }

    try {
      const message = Buffer.from(JSON.stringify(event));
      const result = this.channel.publish(
        this.exchangeName,
        this.routingKey,
        message,
        { persistent: true }
      );

      this.logger.debug(`✅ Evento publicado: ${event.servicio} - ${event.accion} - ${event.entidad}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error publicando evento: ${errorMessage}`);
      return false;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.isConnected = false;
      this.logger.log('Conexión con RabbitMQ cerrada');
    } catch (error) {
      this.logger.error('Error cerrando conexión RabbitMQ');
    }
  }
}