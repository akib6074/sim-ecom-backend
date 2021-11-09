import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  TicketDepartmentDto,
  TicketDepartmentEntity,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class TicketDepartmentService
  implements GeneralService<TicketDepartmentDto>
{
  constructor(
    @InjectRepository(TicketDepartmentEntity)
    private readonly departmentRepository: Repository<TicketDepartmentEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<TicketDepartmentDto[]> {
    try {
      const allDepartments = await this.departmentRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >(allDepartments);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(
    departmentDto: TicketDepartmentDto,
  ): Promise<TicketDepartmentDto[]> {
    try {
      const allDepartments = await this.departmentRepository.find({
        where: {
          ...departmentDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >(allDepartments);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[TicketDepartmentDto[], number]> {
    try {
      const allDepartments = await this.departmentRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >(allDepartments);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: TicketDepartmentDto): Promise<TicketDepartmentDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >(dto);

      const department = this.departmentRepository.create(dtoToEntity);
      await this.departmentRepository.save(department);
      return this.conversionService.toDto<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >(department);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(
    id: string,
    dto: TicketDepartmentDto,
  ): Promise<TicketDepartmentDto> {
    try {
      const saveDto = await this.getDepartment(id);

      const dtoToEntity = await this.conversionService.toEntity<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >({ ...saveDto, ...dto });

      const updatedDepartment = await this.departmentRepository.save(
        dtoToEntity,
        {
          reload: true,
        },
      );
      return this.conversionService.toDto<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >(updatedDepartment);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getDepartment(id);

      const deleted = await this.departmentRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<TicketDepartmentDto> {
    try {
      const department = await this.getDepartment(id);
      return this.conversionService.toDto<
        TicketDepartmentEntity,
        TicketDepartmentDto
      >(department);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/

  async getDepartment(id: string): Promise<TicketDepartmentEntity> {
    const department = await this.departmentRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(department, 'Departments Not Found!!');
    return department;
  }
  /*********************** End checking relations of post *********************/
}
