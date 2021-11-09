import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsController } from './controllers/contact-us.controller';
import { ContactUsService } from './services/contact-us.service';
import {
  ContactUsEntity,
  ConversionService,
  ExceptionService,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUsEntity])],
  controllers: [ContactUsController],
  providers: [
    ContactUsService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class ContactUsModule {}
