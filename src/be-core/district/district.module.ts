import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistrictController } from './controllers/district.controller';
import { DistrictService } from './services/district.service';
import {
  ConversionService,
  DistrictEntity,
  ExceptionService,
  RequestService,
  ResponseService,
  StateEntity,
} from '@simec/ecom-common';

@Module({
  imports: [TypeOrmModule.forFeature([DistrictEntity, StateEntity])],
  controllers: [DistrictController],
  providers: [
    DistrictService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class DistrictModule {}
