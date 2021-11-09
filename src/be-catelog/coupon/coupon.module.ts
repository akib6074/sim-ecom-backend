import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttributeEntity,
  CategoryEntity,
  ConversionService,
  CouponEntity,
  ExceptionService,
  MerchantEntity,
  PermissionService,
  ProductAttributeEntity,
  ProductEntity,
  PromotionEntity,
  RequestService,
  ResponseService,
  ShopEntity,
  ShopTypeEntity,
  ThanaEntity,
  UserEntity,
} from '@simec/ecom-common';
import { CouponController } from './controllers/coupon.controller';
import { CouponService } from './services/coupon.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CategoryEntity,
      ProductEntity,
      AttributeEntity,
      ProductAttributeEntity,
      ShopEntity,
      UserEntity,
      ThanaEntity,
      MerchantEntity,
      ShopTypeEntity,
      PromotionEntity,
    ]),
  ],
  controllers: [CouponController],
  providers: [
    CouponService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    PermissionService,
  ],
})
export class CouponModule {}
