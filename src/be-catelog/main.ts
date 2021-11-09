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

  const logger = new Logger('E-Com Catelog Bootstrap');

  const microService = {
    name: configService.get('CATELOG_SERVICE_NAME'),
    url: configService.get('CATELOG_SERVICE_URL'),
    port: configService.get('CATELOG_APP_PORT'),
  };

  app.connectMicroservice({
    name: microService.name,
    transport: Transport.REDIS,
    options: { url: microService.url },
  });

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Catelog microservice API')
    .setDescription('E-Com catelog microservice API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('ecom-catelog', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors();

  app.useGlobalFilters(new SystemExceptionFilter());
  app.useGlobalFilters(new FieldExceptionFilter());

  await app.startAllMicroservicesAsync();
  await app.listen(microService.port);

  logger.log(`Catelog microservice is running in port:${microService.port}`);
}
bootstrap();
