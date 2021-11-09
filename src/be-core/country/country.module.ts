import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryController } from './controllers/country.controller';
import { CountryService } from './services/country.service';
import {
  ConversionService,
  CountryEntity,
  CurrencyEntity,
  ExceptionService,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity, CurrencyEntity])],
  controllers: [CountryController],
  providers: [
    CountryService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class CountryModule {}
