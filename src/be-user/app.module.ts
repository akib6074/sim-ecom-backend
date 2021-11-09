import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { publicUrls } from './public.url';
import {
  AuthMiddleware,
  configEnvironment,
  configRedis,
  configTypeorm,
  PublicMiddleware,
} from '@simec/ecom-common';

@Module({
  imports: [
    configEnvironment(),
    configTypeorm(),
    configRedis(),
    AuthModule,
    UserModule,
  ],
  controllers: [],
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
