import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  ExceptionService,
  MerchantEntity,
  PermissionService,
  PromotionEntity,
  RequestService,
  ResponseService,
  ShopEntity,
  ShopTypeEntity,
  UserEntity,
} from '@simec/ecom-common';
import { ShopController } from './controllers/shop.controller';
import { ShopService } from './services/shop.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopEntity,
      UserEntity,
      MerchantEntity,
      ShopTypeEntity,
      PromotionEntity,
    ]),
  ],
  controllers: [ShopController],
  providers: [
    ShopService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    PermissionService,
  ],
})
export class ShopModule {}
