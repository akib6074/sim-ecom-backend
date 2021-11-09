import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttributeEntity,
  ConversionService,
  ExceptionService,
  ProductAttributeEntity,
  ProductEntity,
  RequestService,
  ResponseService,
  StockPurchaseEntity,
} from '@simec/ecom-common';
import { ProductAttributeService } from './services/product-attribute.service';
import { ProductAttributeController } from './controllers/product-attribute.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      AttributeEntity,
      StockPurchaseEntity,
      ProductAttributeEntity,
    ]),
  ],
  controllers: [ProductAttributeController],
  providers: [
    ProductAttributeService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class ProductAttributeModule {}
