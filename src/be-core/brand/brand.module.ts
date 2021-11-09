import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandController } from './controllers/brand.controller';
import { BrandService } from './services/brand.service';
import {
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
  BrandEntity,
} from '@simec/ecom-common';

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity])],
  controllers: [BrandController],
  providers: [
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    BrandService,
  ],
})
export class BrandModule {}
