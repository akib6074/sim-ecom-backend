import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  AuthMiddleware,
  configEnvironment,
  PublicMiddleware,
} from '@simec/ecom-common';
import { ImageUploadModule } from './image-upload/image-upload.module';
import { publicUrls } from './public.url';

@Module({
  imports: [configEnvironment(), ImageUploadModule],
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
