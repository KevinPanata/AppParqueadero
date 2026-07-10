import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitamos CORS para que tu dashboard pueda conectarse
  app.enableCors({
    origin: '*', // En desarrollo permitimos todo. En producción pondrías la URL real de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // 2. Configuramos el prefijo global
  app.setGlobalPrefix('api');

  // 3. Configuramos las validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Levantamos el servidor (siempre va al final)
  // OJO: Le puse 3004 por defecto para que coincida con tu Postman si no hay variable de entorno
  await app.listen(process.env.PORT ?? 3004); 
}
bootstrap();