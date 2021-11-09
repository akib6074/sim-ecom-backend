import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  FieldExceptionFilter,
  SystemExceptionFilter,
} from '@simec/ecom-common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const logger = new Logger('E-Com User Bootstrap');

  const microService = {
    name: configService.get('USER_SERVICE_NAME'),
    url: configService.get('USER_SERVICE_URL'),
    port: configService.get('USER_APP_PORT'),
  };

  app.connectMicroservice({
    name: microService.name,
    transport: Transport.REDIS,
    options: { url: microService.url },
  });

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('User microservice API')
    .setDescription('E-Com user microservice API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('ecom-user', app, document);

  app.enableCors();

  app.useGlobalFilters(new SystemExceptionFilter());
  app.useGlobalFilters(new FieldExceptionFilter());

  await app.startAllMicroservicesAsync();
  await app.listen(microService.port);

  logger.log(`User microservice is running in port:${microService.port}`);
}
bootstrap();
