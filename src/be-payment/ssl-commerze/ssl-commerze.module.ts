import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SslCommerzeService } from './services/ssl-commerze.service';
import { SslCommerzeController } from './controllers/ssl-commerze.controller';
import { ConfigService } from '@nestjs/config';
import {
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
  SslPrepareEntity,
  OnlinePaymentActivityLogEntity,
  TransMasterEntity,
  InvoiceEntity,
  OrderEntity,
  UserEntity,
  PermissionService,
} from '@simec/ecom-common';
import { TransMasterModule } from '../trans-master/trans-master.module';
import { TransMasterService } from '../trans-master/services/trans-master.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SslPrepareEntity,
      OnlinePaymentActivityLogEntity,
      TransMasterEntity,
      InvoiceEntity,
      OrderEntity,
      UserEntity,
    ]),
    TransMasterModule,
  ],
  controllers: [SslCommerzeController],
  providers: [
    SslCommerzeService,
    ConversionService,
    RequestService,
    ResponseService,
    ConfigService,
    ExceptionService,
    TransMasterService,
    PermissionService,
  ],
})
export class SslCommerzeModule {}
