import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  ExceptionService,
  PermissionService,
  RequestService,
  ResponseService,
  TicketDepartmentEntity,
  TicketEntity,
  UserEntity,
} from '@simec/ecom-common';
import { TicketController } from './controllers/ticket.controller';
import { TicketService } from './services/ticket.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketEntity,
      TicketDepartmentEntity,
      UserEntity,
    ]),
  ],
  controllers: [TicketController],
  providers: [
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    TicketService,
    PermissionService,
  ],
})
export class TicketModule {}
