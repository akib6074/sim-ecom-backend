import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttributeEntity,
  AttributeGroupEntity,
  CategoryEntity,
  ConversionService,
  ExceptionService,
  PermissionService,
  ProductEntity,
  PromotionEntity,
  RequestService,
  ResponseService,
  ShopEntity,
  UserEntity,
  StockPurchaseEntity
} from '@simec/ecom-common';
import { EcomCacheModule } from '../../cache/ecom-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ShopEntity,
      CategoryEntity,
      AttributeEntity,
      AttributeGroupEntity,
      UserEntity,
      PromotionEntity,
      StockPurchaseEntity,
    ]),
    EcomCacheModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    PermissionService,
  ],
})
export class ProductModule {}
