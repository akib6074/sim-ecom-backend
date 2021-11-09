import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AffiliatorEntity,
  ConversionService,
  CreateNoteDto,
  CustomerEntity,
  DeleteDto,
  EmployeeEntity,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  NoteDto,
  NoteEntity,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class NoteService implements GeneralService<NoteDto> {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(AffiliatorEntity)
    private readonly affiliatorRepository: Repository<AffiliatorEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<NoteDto[]> {
    try {
      const notes = await this.noteRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<NoteEntity, NoteDto>(notes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(noteDto: NoteDto): Promise<NoteDto[]> {
    try {
      const notes = await this.noteRepository.find({
        where: {
          ...noteDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<NoteEntity, NoteDto>(notes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[NoteDto[], number]> {
    try {
      const notes = await this.noteRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<NoteEntity, NoteDto>(notes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByEmployee(id: string): Promise<NoteDto[]> {
    try {
      const employee = await this.getEmployee(id);
      const notes = await this.noteRepository.find({
        where: {
          employee,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<NoteEntity, NoteDto>(notes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByCustomer(id: string): Promise<NoteDto[]> {
    try {
      const customer = await this.getCustomer(id);
      const notes = await this.noteRepository.find({
        where: {
          customer,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<NoteEntity, NoteDto>(notes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByAffiliator(id: string): Promise<NoteDto[]> {
    try {
      const affiliator = await this.getAffiliator(id);
      const notes = await this.noteRepository.find({
        where: {
          affiliator,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<NoteEntity, NoteDto>(notes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateNoteDto): Promise<NoteDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        NoteEntity,
        NoteDto
      >(dto);

      const note = this.noteRepository.create(dtoToEntity);
      if (dto.employeeID)
        note.employee = await this.getEmployee(dto.employeeID);
      if (dto.affiliatorID)
        note.affiliator = await this.getAffiliator(dto.affiliatorID);
      if (dto.customerID)
        note.customer = await this.getCustomer(dto.customerID);

      await this.noteRepository.save(note);
      return this.conversionService.toDto<NoteEntity, NoteDto>(note);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateNoteDto): Promise<NoteDto> {
    try {
      const saveDto = await this.getNote(id);
      if (dto.employeeID)
        saveDto.employee = await this.getEmployee(dto.employeeID);
      if (dto.affiliatorID)
        saveDto.affiliator = await this.getAffiliator(dto.affiliatorID);

      if (dto.customerID)
        saveDto.customer = await this.getCustomer(dto.customerID);

      const dtoToEntity = await this.conversionService.toEntity<
        NoteEntity,
        NoteDto
      >({ ...saveDto, ...dto });

      const updatedNote = await this.noteRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<NoteEntity, NoteDto>(updatedNote);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getNote(id);

      const deleted = await this.noteRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<NoteDto> {
    try {
      const note = await this.noteRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['customer', 'affiliator', 'employee'] : [],
      });
      return this.conversionService.toDto<NoteEntity, NoteDto>(note);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/
  async getNote(id: string): Promise<NoteEntity> {
    const note = await this.noteRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(note, 'Note Not Found!!');
    return note;
  }

  async getEmployee(id: string): Promise<EmployeeEntity> {
    const employee = await this.employeeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(employee, 'Employee Not Found!!');
    return employee;
  }

  async getAffiliator(id: string): Promise<AffiliatorEntity> {
    const affiliator = await this.affiliatorRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(affiliator, 'Affiliator Not Found!!');
    return affiliator;
  }

  async getCustomer(id: string): Promise<CustomerEntity> {
    const customer = await this.customerRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(customer, 'Customer Not Found!!');
    return customer;
  }

  /*********************** End checking relations of post *********************/
}
