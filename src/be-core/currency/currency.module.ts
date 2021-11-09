import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyController } from './controllers/currency.controller';
import { CurrencyService } from './services/currency.service';
import {
  ConversionService,
  CurrencyEntity,
  ExceptionService,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],
  controllers: [CurrencyController],
  providers: [
    CurrencyService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class CurrencyModule {}
