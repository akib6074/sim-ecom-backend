import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationService } from './services/configuration.service';
import {
  ConfigurationEntity,
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';
import { ConfigurationController } from './controllers/configuration.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigurationEntity])],
  controllers: [ConfigurationController],
  providers: [
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    ConfigurationService,
  ],
})
export class ConfigurationModule {}
