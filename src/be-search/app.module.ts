import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { publicUrls } from './public.url';
import {
  AuthMiddleware,
  configEnvironment,
  configRedis,
  PublicMiddleware,
} from '@simec/ecom-common';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [configEnvironment(), configRedis(), ProductModule, ShopModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(...publicUrls)
      .forRoutes('*');
    consumer.apply(PublicMiddleware).forRoutes('*');
  }
}
