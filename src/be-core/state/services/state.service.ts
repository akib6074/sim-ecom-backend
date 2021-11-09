import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CountryEntity,
  CreateStateDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  StateDto,
  StateEntity,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class StateService implements GeneralService<StateDto> {
  constructor(
    @InjectRepository(StateEntity)
    private readonly stateRepository: Repository<StateEntity>,
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<StateDto[]> {
    try {
      const states = await this.stateRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<StateEntity, StateDto>(states);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(stateDto: StateDto): Promise<StateDto[]> {
    try {
      const states = await this.stateRepository.find({
        where: {
          ...stateDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<StateEntity, StateDto>(states);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[StateDto[], number]> {
    try {
      const states = await this.stateRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<StateEntity, StateDto>(states);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findServiceCoveredByBD(): Promise<StateDto[]> {
    try {
      const country = await this.getBangladesh();
      const serviceCovered = await this.stateRepository
        .createQueryBuilder('state')
        .where({ ...isActive, country })
        .select(['state.id', 'state.name', 'district.id', 'district.name'])
        .leftJoin('state.districts', 'district')
        .getMany();
      return this.conversionService.toDtos<StateEntity, StateDto>(
        serviceCovered,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByCountry(id: string): Promise<StateDto[]> {
    try {
      const country = await this.getCountry(id);
      const states = await this.stateRepository.find({
        where: {
          country,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<StateEntity, StateDto>(states);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateStateDto): Promise<StateDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        StateEntity,
        StateDto
      >(dto);

      const state = this.stateRepository.create(dtoToEntity);
      state.country = await this.getCountry(dto.countryID);
      await this.stateRepository.save(state);

      return this.conversionService.toDto<StateEntity, StateDto>(state);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateStateDto): Promise<StateDto> {
    try {
      const saveDto = await this.getState(id);
      if (dto.countryID) saveDto.country = await this.getCountry(dto.countryID);

      const dtoToEntity = await this.conversionService.toEntity<
        StateEntity,
        StateDto
      >({ ...saveDto, ...dto });

      const updatedState = await this.stateRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<StateEntity, StateDto>(updatedState);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getState(id);

      const deleted = await this.stateRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<StateDto> {
    try {
      const state = await this.stateRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['districts'] : [],
      });
      return this.conversionService.toDto<StateEntity, StateDto>(state);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/
  async getState(id: string): Promise<StateEntity> {
    const state = await this.stateRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(state, 'State Not Found!!');
    return state;
  }

  async getCountry(id: string): Promise<CountryEntity> {
    const country = await this.countryRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(country, 'Country Not Found!!');
    return country;
  }

  async getBangladesh(): Promise<CountryEntity> {
    const country = await this.countryRepository.findOne({
      where: {
        name: 'Bangladesh',
        ...isActive,
      },
    });
    this.exceptionService.notFound(country, 'Country Not Found!!');
    return country;
  }

  /*********************** End checking relations of post *********************/
}
