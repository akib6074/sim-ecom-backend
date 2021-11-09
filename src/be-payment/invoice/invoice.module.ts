import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceService } from './services/invoice.service';
import {
  ConversionService,
  ExceptionService,
  InvoiceDetailsEntity,
  InvoiceEntity,
  RequestService,
  ResponseService,
  TransMasterEntity,
  ProductEntity,
  ProductAttributeEntity,
  OrderEntity,
  UserEntity,
} from '@simec/ecom-common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEntity,
      InvoiceDetailsEntity,
      ProductEntity,
      ProductAttributeEntity,
      TransMasterEntity,
      OrderEntity,
      UserEntity,
    ]),
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    RequestService,
    ExceptionService,
    ConversionService,
    ResponseService,
  ],
})
export class InvoiceModule {}
