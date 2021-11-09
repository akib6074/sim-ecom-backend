import { NestFactory } from '@nestjs/core';
import { ProductModule } from './product.module';
import { ProductService } from './product.service';

async function bootstrap() {
  const app = await NestFactory.create(ProductModule, {});
  const product = app.get(ProductService);
  await product.rebase();
  await app.close();
}

bootstrap();
