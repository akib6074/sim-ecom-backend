import { NestFactory } from '@nestjs/core';
import { FakerModule } from './faker.module';
import { FakerService } from './faker.service';

async function bootstrap() {
  const app = await NestFactory.create(FakerModule, {});
  const faker = app.get(FakerService);

  // console.log(Object.keys(faker));
  await faker.init();
  await app.close();
}
bootstrap();
