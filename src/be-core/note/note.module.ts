import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AffiliatorEntity,
  ConversionService,
  CustomerEntity,
  EmployeeEntity,
  ExceptionService,
  NoteEntity,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';
import { NoteController } from './controllers/note.controller';
import { NoteService } from './services/note.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoteEntity,
      AffiliatorEntity,
      CustomerEntity,
      EmployeeEntity,
    ]),
  ],
  controllers: [NoteController],
  providers: [
    NoteService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class NoteModule {}
