import { ShopTypeService } from './services/shop-type.service';
import { TypeController } from './controllers/shop-type.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
  ShopEntity,
  ShopTypeEntity,
} from '@simec/ecom-common';
import { EcomCacheModule } from '../../cache/ecom-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopTypeEntity, ShopEntity]),
    EcomCacheModule,
  ],
  controllers: [TypeController],
  providers: [
    ShopTypeService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class ShopTypeModule {}
