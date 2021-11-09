import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  CountryEntity,
  ExceptionService,
  RequestService,
  ResponseService,
  StateEntity,
} from '@simec/ecom-common';
import { StateController } from './controllers/state.controller';
import { StateService } from './services/state.service';

@Module({
  imports: [TypeOrmModule.forFeature([StateEntity, CountryEntity])],
  controllers: [StateController],
  providers: [
    StateService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class StateModule {}
