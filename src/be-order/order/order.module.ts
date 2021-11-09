import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AddressEntity,
  CartEntity,
  ConversionService,
  ExceptionService,
  InvoiceDetailsEntity,
  InvoiceEntity,
  OrderDetailsEntity,
  OrderEntity,
  PermissionService,
  ProductEntity,
  RequestService,
  ResponseService,
  ShopEntity,
  TransMasterEntity,
  UserEntity,
} from '@simec/ecom-common';
import { OrderController } from './controllers/order.controller';
import { ProductCountListener } from './listeners/product-count.listener';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderDetailsEntity,
      UserEntity,
      CartEntity,
      InvoiceEntity,
      InvoiceDetailsEntity,
      TransMasterEntity,
      AddressEntity,
      ProductEntity,
      ShopEntity,
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    ProductCountListener,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    PermissionService,
  ],
})
export class OrderModule {}
