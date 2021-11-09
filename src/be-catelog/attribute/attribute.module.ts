import { Module } from '@nestjs/common';
import { AttributeController } from './controllers/attribute.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttributeEntity,
  AttributeGroupEntity,
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';
import { AttributeService } from './services/attribute.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttributeEntity, AttributeGroupEntity])],
  controllers: [AttributeController],
  providers: [
    AttributeService,
    ExceptionService,
    ConversionService,
    RequestService,
    ResponseService,
  ],
})
export class AttributeModule {}
