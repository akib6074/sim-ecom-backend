import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentialAreaController } from './controllers/residential-area.controller';
import { ResidentialAreaService } from './services/residential-area.service';
import {
  ConversionService,
  ExceptionService,
  RequestService,
  ResidentialAreaEntity,
  ResponseService,
  ThanaEntity,
} from '@simec/ecom-common';

@Module({
  imports: [TypeOrmModule.forFeature([ResidentialAreaEntity, ThanaEntity])],
  controllers: [ResidentialAreaController],
  providers: [
    ResidentialAreaService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class ResidentialAreaModule {}
