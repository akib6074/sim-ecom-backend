import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketDepartmentController } from './controllers/ticket-department.controller';
import { TicketDepartmentService } from './services/ticket-department.service';
import {
  ConversionService,
  TicketDepartmentEntity,
  ExceptionService,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';

@Module({
  imports: [TypeOrmModule.forFeature([TicketDepartmentEntity])],
  controllers: [TicketDepartmentController],
  providers: [
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    TicketDepartmentService,
  ],
})
export class TicketDepartmentModule {}
