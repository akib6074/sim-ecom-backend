import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  configEnvironment,
  configTypeorm,
  ProductEntity,
  PromotionEntity,
  ShopEntity,
  UserEntity,
  CategoryEntity,
  ShopTypeEntity,
} from '@simec/ecom-common';
import { CommonFakerModule } from '../common-faker/common-faker.module';
import { PromotionFaker } from './promotion.faker';

const services = [PromotionFaker];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromotionEntity,
      ShopEntity,
      UserEntity,
      ProductEntity,
      ShopTypeEntity,
      CategoryEntity,
    ]),
    configEnvironment(),
    configTypeorm(),
    CommonFakerModule,
  ],
  providers: [...services],
  exports: [...services],
})
export class PromotionModule {}
