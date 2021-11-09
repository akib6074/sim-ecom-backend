import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CreateThanaDto,
  DeleteDto,
  DistrictEntity,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
  ThanaDto,
  ThanaEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class ThanaService implements GeneralService<ThanaDto> {
  constructor(
    @InjectRepository(ThanaEntity)
    private readonly thanaRepository: Repository<ThanaEntity>,
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<ThanaDto[]> {
    try {
      const thanas = await this.thanaRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<ThanaEntity, ThanaDto>(thanas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(thanaDto: ThanaDto): Promise<ThanaDto[]> {
    try {
      const thanas = await this.thanaRepository.find({
        where: {
          ...thanaDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<ThanaEntity, ThanaDto>(thanas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ThanaDto[], number]> {
    try {
      const thanas = await this.thanaRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<ThanaEntity, ThanaDto>(thanas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByDistrict(id: string): Promise<ThanaDto[]> {
    try {
      const district = await this.getDistrict(id);
      const thanas = await this.thanaRepository.find({
        where: {
          district,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<ThanaEntity, ThanaDto>(thanas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateThanaDto): Promise<ThanaDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        ThanaEntity,
        ThanaDto
      >(dto);

      const thana = this.thanaRepository.create(dtoToEntity);
      thana.district = await this.getDistrict(dto.districtID);
      await this.thanaRepository.save(thana);

      return this.conversionService.toDto<ThanaEntity, ThanaDto>(thana);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateThanaDto): Promise<ThanaDto> {
    try {
      const saveDto = await this.getThana(id);
      if (dto.districtID)
        saveDto.district = await this.getDistrict(dto.districtID);

      const dtoToEntity = await this.conversionService.toEntity<
        ThanaEntity,
        ThanaDto
      >({ ...saveDto, ...dto });

      const updatedThana = await this.thanaRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<ThanaEntity, ThanaDto>(updatedThana);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getThana(id);

      const deleted = await this.thanaRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<ThanaDto> {
    try {
      const thana = await this.thanaRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['thanas'] : [],
      });
      return this.conversionService.toDto<ThanaEntity, ThanaDto>(thana);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/
  async getThana(id: string): Promise<ThanaEntity> {
    const thana = await this.thanaRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(thana, 'Thana Not Found!!');
    return thana;
  }

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
  /*********************** End checking relations of post *********************/
}
