import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { publicUrls } from './public.url';
import {
  AuthMiddleware,
  configEnvironment,
  configRedis,
  configTypeorm,
  PublicMiddleware,
} from '@simec/ecom-common';
import { NotificationModule } from './notification/notification.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    configEnvironment(),
    configTypeorm(),
    configRedis(),
    MailModule,
    NotificationModule,
    SmsModule,
  ],
  exports: [NotificationModule],
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
