import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './services/notification.service';
import {
  ConversionService,
  ExceptionService,
  NotificationEntity,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';
import { NotificationController } from './controllers/notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationController],
  exports: [NotificationService],
  providers: [
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    NotificationService,
  ],
})
export class NotificationModule {}
