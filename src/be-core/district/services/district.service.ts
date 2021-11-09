import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CreateDistrictDto,
  DeleteDto,
  DistrictDto,
  DistrictEntity,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  StateEntity,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class DistrictService implements GeneralService<DistrictDto> {
  constructor(
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    @InjectRepository(StateEntity)
    private readonly stateRepository: Repository<StateEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<DistrictDto[]> {
    try {
      const districts = await this.districtRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<DistrictEntity, DistrictDto>(
        districts,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(districtDto: DistrictDto): Promise<DistrictDto[]> {
    try {
      const districts = await this.districtRepository.find({
        where: {
          ...districtDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<DistrictEntity, DistrictDto>(
        districts,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[DistrictDto[], number]> {
    try {
      const districts = await this.districtRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<DistrictEntity, DistrictDto>(
        districts,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByState(id: string): Promise<DistrictDto[]> {
    try {
      const state = await this.getState(id);
      const districts = await this.districtRepository.find({
        where: {
          state,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<DistrictEntity, DistrictDto>(
        districts,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateDistrictDto): Promise<DistrictDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        DistrictEntity,
        DistrictDto
      >(dto);

      const district = this.districtRepository.create(dtoToEntity);
      district.state = await this.getState(dto.stateID);

      await this.districtRepository.save(district);
      return this.conversionService.toDto<DistrictEntity, DistrictDto>(
        district,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateDistrictDto): Promise<DistrictDto> {
    try {
      const saveDto = await this.getDistrict(id);
      if (dto.stateID) saveDto.state = await this.getState(dto.stateID);

      const dtoToEntity = await this.conversionService.toEntity<
        DistrictEntity,
        DistrictDto
      >({ ...saveDto, ...dto });

      const updatedDistrict = await this.districtRepository.save(dtoToEntity, {
        reload: true,
      });

      return this.conversionService.toDto<DistrictEntity, DistrictDto>(
        updatedDistrict,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getDistrict(id);

      const deleted = await this.districtRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<DistrictDto> {
    try {
      const district = await this.districtRepository.findOne(
        {
          id,
          ...isActive,
        },
        {
          relations: relation ? ['thanas'] : [],
        },
      );
      return this.conversionService.toDto<DistrictEntity, DistrictDto>(
        district,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/

  async getDistrict(id: string): Promise<DistrictEntity> {
    const district = await this.districtRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(district, 'District Not Found!!');
    return district;
  }

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
  /*********************** End checking relations of post *********************/
}
