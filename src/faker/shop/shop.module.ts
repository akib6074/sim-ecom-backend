import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopFaker } from './shop.faker';
import { CommonFakerModule } from '../common-faker/common-faker.module';
import {
  configEnvironment,
  configTypeorm,
  ShopEntity,
} from '@simec/ecom-common';

const services = [ShopFaker];

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopEntity]),
    configEnvironment(),
    configTypeorm(),
    CommonFakerModule,
  ],
  providers: [...services],
  exports: [...services],
})
export class ShopModule {}
