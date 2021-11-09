import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto, ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
  BrandEntity,
  BrandDto
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class BrandService implements GeneralService<BrandDto> {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<BrandDto[]> {
    try {
      const allBrands = await this.brandRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<BrandEntity, BrandDto>(
        allBrands,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(brandDto: BrandDto): Promise<BrandDto[]> {
    try {
      const allBrands = await this.brandRepository.find({
        where: {
          ...brandDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<BrandEntity, BrandDto>(
        allBrands,
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
  ): Promise<[BrandDto[], number]> {
    try {
      const allBrands = await this.brandRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<BrandEntity, BrandDto>(
        allBrands,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: BrandDto): Promise<BrandDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        BrandEntity,
        BrandDto
      >(dto);

      const brand = this.brandRepository.create(dtoToEntity);
      await this.brandRepository.save(brand);
      return this.conversionService.toDto<BrandEntity, BrandDto>(
        brand,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: BrandDto): Promise<BrandDto> {
    try {
      const saveDto = await this.getBrnad(id);

      const dtoToEntity = await this.conversionService.toEntity<
        BrandEntity,
        BrandDto
      >({ ...saveDto, ...dto });

      const updatedBrand = await this.brandRepository.save(
        dtoToEntity,
        {
        reload: true,
      });
      return this.conversionService.toDto<BrandEntity, BrandDto>(
        updatedBrand,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getBrnad(id);

      const deleted = await this.brandRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<BrandDto> {
    try {
      const brand = await this.getBrnad(id);
      return this.conversionService.toDto<BrandEntity, BrandDto>(
        brand,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/

  async getBrnad(id: string): Promise<BrandEntity> {
    const brand = await this.brandRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(brand, 'Brand Not Found!!');
    return brand;
  }
  /*********************** End checking relations of post *********************/
}
