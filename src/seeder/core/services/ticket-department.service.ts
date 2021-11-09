import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TicketDepartmentEntity,
  ticketDepartmentObject,
} from '@simec/ecom-common';

@Injectable()
export class TicketDepartmentService {
  private readonly logger = new Logger(TicketDepartmentService.name);

  constructor(
    @InjectRepository(TicketDepartmentEntity)
    private readonly ticketDepartmentRepository: Repository<TicketDepartmentEntity>,
  ) {}

  initTicketDepartment = async (): Promise<void> => {
    try {
      for (const department of ticketDepartmentObject) {
        const departmentEntity = new TicketDepartmentEntity();
        departmentEntity.name = department.name;
        departmentEntity.createAt = new Date();
        departmentEntity.updatedAt = new Date();

        const created = await this.ticketDepartmentRepository.create(
          departmentEntity,
        );
        await this.ticketDepartmentRepository.save(created);
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
  };
}
