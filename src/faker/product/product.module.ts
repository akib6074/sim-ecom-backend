import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductFaker } from './product.faker';
import {
  AttributeEntity,
  AttributeGroupEntity,
  configEnvironment,
  configTypeorm,
  ProductAttributeEntity,
  ProductEntity,
  StockPurchaseEntity,
} from '@simec/ecom-common';
import { CommonFakerModule } from '../common-faker/common-faker.module';

const services = [ProductFaker];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttributeGroupEntity,
      StockPurchaseEntity,
      AttributeEntity,
      ProductAttributeEntity,
      ProductEntity,
    ]),
    configEnvironment(),
    configTypeorm(),
    CommonFakerModule,
  ],
  providers: [...services],
  exports: [...services],
})
export class ProductModule {}
