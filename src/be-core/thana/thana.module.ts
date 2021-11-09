import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  DistrictEntity,
  ExceptionService,
  RequestService,
  ResponseService,
  ThanaEntity,
} from '@simec/ecom-common';
import { ThanaController } from './controllers/thana.controller';
import { ThanaService } from './services/thana.service';

@Module({
  imports: [TypeOrmModule.forFeature([ThanaEntity, DistrictEntity])],
  controllers: [ThanaController],
  providers: [
    ThanaService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class ThanaModule {}
