import { Module } from '@nestjs/common';
import { AttributeGroupController } from './controllers/attribute-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AttributeGroupEntity,
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';
import { AttributeGroupService } from './services/attribute-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttributeGroupEntity])],
  controllers: [AttributeGroupController],
  providers: [
    AttributeGroupService,
    ExceptionService,
    ConversionService,
    RequestService,
    ResponseService,
  ],
})
export class AttributeGroupModule {}
