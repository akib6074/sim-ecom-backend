import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(SeederModule, {});
  const seeder = app.get(SeederService);

  await seeder.initializeData();
  await app.close();
}
bootstrap();
