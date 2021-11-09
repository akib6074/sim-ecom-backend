import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { publicUrls } from './public.url';
import {
  AuthMiddleware,
  configEnvironment,
  configRedis,
  configTypeorm,
  PublicMiddleware,
} from '@simec/ecom-common';
import { CronJobModule } from './cron-job/cron-job.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    configEnvironment(),
    configTypeorm(),
    configRedis(),
    ScheduleModule.forRoot(),
    CronJobModule
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
