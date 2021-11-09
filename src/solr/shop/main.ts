import { NestFactory } from '@nestjs/core';
import { ShopModule } from './shop.module';
import { ShopService } from './shop.service';

async function bootstrap() {
  const app = await NestFactory.create(ShopModule, {});
  const shopService = app.get(ShopService);
  await shopService.rebase();
  await app.close();
}

bootstrap();
