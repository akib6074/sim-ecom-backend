import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CreateTicketDto,
  DeleteDto,
  TicketDepartmentEntity,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
  TicketDto,
  TicketEntity,
  TicketStatus,
  ChangeTicketStatusDto,
  PermissionService,
  UserEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class TicketService implements GeneralService<TicketDto> {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(TicketDepartmentEntity)
    private readonly departmentRepository: Repository<TicketDepartmentEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly permissionService: PermissionService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<TicketDto[]> {
    try {
      const allTickets = await this.ticketRepository.find({
        where: { ...isActive },
        relations: ['user'],
      });
      return this.conversionService.toDtos<TicketEntity, TicketDto>(allTickets);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(ticketDto: TicketDto): Promise<TicketDto[]> {
    try {
      const allTickets = await this.ticketRepository.find({
        where: {
          ...ticketDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<TicketEntity, TicketDto>(allTickets);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[TicketDto[], number]> {
    try {
      const allTickets = await this.ticketRepository.findAndCount({
        where: { ...isActive },
        relations: ['ticketDepartment','user'],
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<TicketEntity, TicketDto>(
        allTickets,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateTicketDto): Promise<TicketDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        TicketEntity,
        TicketDto
      >(dto);

      const ticket = this.ticketRepository.create(dtoToEntity);
      ticket.status = TicketStatus.OnHold;
      const department = await this.departmentRepository.findOne({
        where: {
          id: dto.departmentId,
          ...isActive,
        },
      });

      const user = this.permissionService.returnRequest().userId;
      ticket.user = await this.getUser(user);
      ticket.ticketDepartment = department;
      console.log(ticket.user);
      await this.ticketRepository.save(ticket);
      return this.conversionService.toDto<TicketEntity, TicketDto>(ticket);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: TicketDto): Promise<TicketDto> {
    try {
      const saveDto = await this.getTickets(id);

      const dtoToEntity = await this.conversionService.toEntity<
        TicketEntity,
        TicketDto
      >({ ...saveDto, ...dto });

      const updatedTicket = await this.ticketRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<TicketEntity, TicketDto>(
        updatedTicket,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getTickets(id);

      const deleted = await this.ticketRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<TicketDto> {
    try {
      const ticket = await this.getTickets(id);
      return this.conversionService.toDto<TicketEntity, TicketDto>(ticket);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async changeTicketStatus(dto: ChangeTicketStatusDto): Promise<TicketDto> {
    try {
      const ticket = await this.findById(dto.ticketId);
      const ticketEntity = await this.conversionService.toEntity<
        TicketEntity,
        TicketDto
      >(ticket);
      ticketEntity.status = dto.status;
      await this.ticketRepository.save(ticketEntity);
      return this.conversionService.toDto<TicketEntity, TicketDto>(
        ticketEntity,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/

  async getTickets(id: string): Promise<TicketEntity> {
    const tickets = await this.ticketRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(tickets, 'Tickets Not Found!!');
    return tickets;
  }
  /*********************** End checking relations of post *********************/
  async getUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      id: id,
      ...isActive,
    });
    this.exceptionService.notFound(user, 'User not found');
    return user;
  }
}
