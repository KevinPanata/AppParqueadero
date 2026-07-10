import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from 'amqplib';
import { getLocalIpAndMac } from './network.utils';

export interface AuditEvent{
	servicio:string;
	accion:string;
	entidad:string;
	datos?:any;
	usuario?:string;
	ip?:string;
	mac?:string;
}


@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy{
	private readonly logger = new Logger(EventPublisher.name);
	private connection: amqp.ChannelModel;
	private channel: amqp.Channel;
	private exchangeName: string;
	private routingKey: string;

	constructor(private configService: ConfigService){
		this.exchangeName = this.configService.get<string>('RABBITMQ_EXCHANGE') ?? '';
		this.routingKey = this.configService.get<string>('RABBITMQ_ROUTING_KEY') ?? '';
	}

	async onModuleInit() {
		await this.connect();
	}

  private async connect() {
    try {
        const host = this.configService.get('RABBITMQ_HOST');
        const port = this.configService.get('RABBITMQ_PORT');
        const user = this.configService.get('RABBITMQ_USER');
        const pass = this.configService.get('RABBITMQ_PASSWORD');
        const url = `amqp://${user}:${pass}@${host}:${port}`;

        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchangeName, 'topic', {durable: true});
      this.logger.log(`Connected to RabbitMQ at ${url}`);

     } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ at ${error}`);
      setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
    }
  }

  async publishEvent(event: AuditEvent): Promise<void>{
    if(!this.channel){
      this.logger.warn("Channel is not established. Attempting to connect...");
      return;
    }
    try {
      const { ip, mac } = getLocalIpAndMac();
      const mappedEvent = {
        servicio: event.servicio.startsWith('ms-') ? event.servicio : `ms-${event.servicio}`,
        action: event.accion.toUpperCase(),
        entidad: event.entidad.toUpperCase(),
        datos: event.datos,
        usuario: event.usuario || 'system',
        ip: event.ip || ip,
        mac: event.mac || mac,
      };

      const message = Buffer.from(JSON.stringify(mappedEvent));
      this.channel.publish(
        this.exchangeName,
        this.routingKey,
        message,
        {persistent: true}
      );
      this.logger.log(`Evento de auditoría registrado con éxito: ${mappedEvent.servicio} - ${mappedEvent.action} - ${mappedEvent.entidad}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error}`);
    }
  }

  async onModuleDestroy(){
    if(this.channel){
      await this.channel.close();
    }
    if(this.connection){
      await this.connection.close();
    }    
  }
}

