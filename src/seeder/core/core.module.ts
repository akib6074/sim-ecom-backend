import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreService } from './services/core.service';
import { CountryService } from './services/country.service';
import { CurrencyService } from './services/currency.service';
import { DistrictService } from './services/district.service';
import { StateService } from './services/state.service';
import { ThanaService } from './services/thana.service';
import {
  CountryEntity,
  CurrencyEntity,
  DistrictEntity,
  ShopTypeEntity,
  StateEntity,
  ThanaEntity,
  TicketDepartmentEntity,
} from '@simec/ecom-common';
import { ShopTypeService } from './services/shop-type.service';
import { TicketDepartmentService } from './services/ticket-department.service';

const services = [
  CountryService,
  CurrencyService,
  CoreService,
  StateService,
  DistrictService,
  ThanaService,
  ShopTypeService,
  TicketDepartmentService,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountryEntity,
      CurrencyEntity,
      StateEntity,
      DistrictEntity,
      ThanaEntity,
      ShopTypeEntity,
      TicketDepartmentEntity,
    ]),
  ],
  exports: [...services],
  controllers: [],
  providers: [...services],
})
export class CoreModule {}
