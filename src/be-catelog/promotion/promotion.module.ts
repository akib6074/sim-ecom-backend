import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
  CategoryEntity,
  ConversionService,
  ExceptionService,
  PermissionService,
  ProductEntity,
  PromotionEntity,
  RequestService,
  ResponseService,
  ShopEntity,
  ShopTypeEntity,
  UserEntity,
} from '@simec/ecom-common';
import {PromotionController} from './controllers/promotion.controller';
import {PromotionService} from './services/promotion.service';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionEntity,ShopEntity,ShopTypeEntity,ProductEntity,CategoryEntity,UserEntity])],
  controllers: [PromotionController],
  providers: [
    PromotionService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
      PermissionService
  ],
})
export class PromotionModule {}
