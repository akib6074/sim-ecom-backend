import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
  OnlinePaymentActivityLogEntity,
  UserEntity,
} from '@simec/ecom-common';
import { OnlinePaymentActivityLogService } from './services/online-payment-activity-log.service';
import { OnlinePaymentActivityLogController } from './controllers/online-payment-activity-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OnlinePaymentActivityLogEntity]),
  ],
  controllers: [OnlinePaymentActivityLogController],
  providers: [
    OnlinePaymentActivityLogService,
    RequestService,
    ExceptionService,
    ConversionService,
    ResponseService,
  ],
})
export class OnlinePaymentActivityLogModule {}
