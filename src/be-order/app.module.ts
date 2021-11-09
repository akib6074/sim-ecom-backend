import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { publicUrls } from './public.url';
import {
  AuthMiddleware,
  configEnvironment,
  configRedis,
  configTypeorm,
  PublicMiddleware,
} from '@simec/ecom-common';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    configEnvironment(),
    configTypeorm(),
    configRedis(),
    CartModule,
    OrderModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PublicMiddleware).forRoutes('*');
    consumer
      .apply(AuthMiddleware)
      .exclude(...publicUrls)
      .forRoutes('*');
  }
}
