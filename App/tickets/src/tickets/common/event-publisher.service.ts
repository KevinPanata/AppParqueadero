import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export interface AuditEvent {
  servicio: string;
  accion: string;
  entidad: string;
  datos?: Record<string, unknown>;
  usuario?: string;
  idPersona?: string;
  ip: string;
  mac: string;
}

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPublisher.name);

  private connection: any;
  private channel: any;
  private exchangeName: string;
  private routingKey: string;

  constructor(private readonly configService: ConfigService) {
    this.exchangeName =
      this.configService.get<string>('RABBITMQ_EXCHANGE') ?? 'exchange_audit';

    this.routingKey =
      this.configService.get<string>('RABBITMQ_ROUTING_KEY') ?? 'routing_audit';
  }

  async onModuleInit() {
    await this.connect();
  }

  private async connect(): Promise<void> {
    try {
      const host = this.configService.get<string>('RABBITMQ_HOST');
      const port = this.configService.get<string>('RABBITMQ_PORT');
      const user = this.configService.get<string>('RABBITMQ_USER');
      const pass = this.configService.get<string>('RABBITMQ_PASSWORD');

      const url = `amqp://${user}:${pass}@${host}:${port}`;

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      this.logger.log(`Conectado a RabbitMQ: ${url}`);
    } catch (error) {
      this.logger.error(`Error conectando a RabbitMQ: ${error}`);
      setTimeout(() => void this.connect(), 5000);
    }
  }

  async publish(event: AuditEvent): Promise<void> {
    if (!this.channel) {
      this.logger.warn('No hay canal RabbitMQ. Intentando reconectar...');
      await this.connect();
    }

    if (!this.channel) {
      this.logger.error('No se pudo publicar el evento de auditoría');
      return;
    }

    try {
      const message = Buffer.from(JSON.stringify(event));

      this.channel.publish(this.exchangeName, this.routingKey, message, {
        persistent: true,
      });

      this.logger.debug(
        `Evento publicado: ${event.servicio} - ${event.accion} - ${event.entidad}`,
      );
    } catch (error) {
      this.logger.error(`Error publicando evento: ${error}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.logger.log('Canal RabbitMQ cerrado');
    }

    if (this.connection) {
      await this.connection.close();
      this.logger.log('Conexión RabbitMQ cerrada');
    }
  }
}