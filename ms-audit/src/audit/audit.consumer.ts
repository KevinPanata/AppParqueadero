import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';
import * as amqp from 'amqplib';
import { plainToClass } from 'class-transformer';
import { CreateAuditEventDto } from './dto/create-audit-event.dto';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class AuditConsumer implements OnModuleInit {
  private readonly logger = new Logger(AuditConsumer.name);
  private connection: any;
  private channel: any;

  // 1. Primero va el constructor
  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  // 2. Un solo onModuleInit que integre el diagnóstico y la ejecución
  async onModuleInit() {
    this.logger.debug('--- DIAGNÓSTICO DE RABBITMQ ---');
    this.logger.debug(`EXCHANGE: ${this.configService.get('RABBITMQ_EXCHANGE')}`);
    this.logger.debug(`QUEUE: ${this.configService.get('RABBITMQ_QUEUE')}`);
    this.logger.debug(`ROUTING_KEY: ${this.configService.get('RABBITMQ_ROUTING_KEY')}`);
    this.logger.debug('-------------------------------');

    await this.connect();
  }

  private async connect() {
    // Si port, user o pass son undefined, tomará valores por defecto o fallará
    const host = this.configService.get('RABBITMQ_HOST') || 'rabbitmq';
    const port = this.configService.get('RABBITMQ_PORT') || 5672;
    const user = this.configService.get('RABBITMQ_USER') || 'admin';
    const pass = this.configService.get('RABBITMQ_PASSWORD') || 'admin123';
    
    const url = `amqp://${user}:${pass}@${host}:${port}`;

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.log(`Connected to RabbitMQ at ${url}`);
      await this.consume(); // Start consuming after successful connection
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ at ${error}`);
      setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
    }
  }

  private async consume() {
    const queue = this.configService.get('RABBITMQ_QUEUE');
    const exchange = this.configService.get('RABBITMQ_EXCHANGE');
    const routingKey = this.configService.get('RABBITMQ_ROUTING_KEY');

    // Validación de seguridad para evitar que intente conectar a undefined
    if (!queue || !exchange || !routingKey) {
      this.logger.error('Faltan variables de entorno para RabbitMQ. Revisa tu docker-compose.yml');
      return;
    }

    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, routingKey);

      this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            const content = msg.content.toString();
            this.logger.debug(`Mensaje recibido: ${content}`);
            try {
              const raw = JSON.parse(content);
              const dto = plainToClass(CreateAuditEventDto, raw);
              const errors = await validate(dto);

              if (Array.isArray(errors) && errors.length > 0) {
                const errorMessages = errors.map((e: ValidationError) =>
                  Object.values(e.constraints || {}).join(', '),
                );
                this.logger.warn(`DTO inválido: ${errorMessages.join('; ')}`);
                this.channel.nack(msg, false, false);
                return;
              }

              await this.auditService.create(dto);
              this.logger.log(`Evento de auditoría registrado con éxito: ${dto.servicio} - ${dto.action} - ${dto.entidad}`);
              this.channel.ack(msg);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
              this.logger.error(`Error procesando mensaje: ${errorMessage}`);
              this.channel.nack(msg, false, false);
            }
          }
        },
        { noAck: false },
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error configurando consumidor: ${errorMessage}`);
    }
  }
}