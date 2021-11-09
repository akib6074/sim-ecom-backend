import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFakerService } from './common-faker.service';
import {
  CategoryEntity,
  configEnvironment,
  configTypeorm,
  CountryEntity,
  DistrictEntity,
  MerchantEntity,
  ResidentialAreaEntity,
  ShopEntity,
  ShopTypeEntity,
  StateEntity,
  ThanaEntity,
  UserEntity,
} from '@simec/ecom-common';

const services = [CommonFakerService];
const entities = [
  UserEntity,
  CountryEntity,
  StateEntity,
  DistrictEntity,
  ThanaEntity,
  ResidentialAreaEntity,
  MerchantEntity,
  ShopEntity,
  CategoryEntity,
  ShopTypeEntity,
];
@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    configEnvironment(),
    configTypeorm(),
  ],
  providers: services,
  exports: services,
})
export class CommonFakerModule {}
