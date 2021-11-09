import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  ExceptionService,
  InvoiceEntity,
  RequestService,
  ResponseService,
  OnlinePaymentActivityLogEntity,
  TransMasterEntity,
  UserEntity,
  PermissionService,
} from '@simec/ecom-common';
import { TransMasterService } from './services/trans-master.service';
import { TransMasterController } from './controllers/trans-master.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEntity,
      TransMasterEntity,
      UserEntity,
      OnlinePaymentActivityLogEntity,
    ]),
  ],
  controllers: [TransMasterController],
  providers: [
    TransMasterService,
    RequestService,
    ExceptionService,
    ConversionService,
    ResponseService,
    PermissionService,
  ],
})
export class TransMasterModule {}
