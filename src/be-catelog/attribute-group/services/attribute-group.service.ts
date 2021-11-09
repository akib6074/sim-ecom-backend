import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AttributeGroupDto,
  AttributeGroupEntity,
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class AttributeGroupService
  implements GeneralService<AttributeGroupDto>
{
  constructor(
    @InjectRepository(AttributeGroupEntity)
    private readonly attributeGroupRepository: Repository<AttributeGroupEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<AttributeGroupDto[]> {
    try {
      const attributeGroups = await this.attributeGroupRepository.find({
        where: { ...isActive },
        relations: ['attributes'],
      });
      return this.conversionService.toDtos<
        AttributeGroupEntity,
        AttributeGroupDto
      >(attributeGroups);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: AttributeGroupDto): Promise<AttributeGroupDto[]> {
    try {
      const attributes = await this.attributeGroupRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        AttributeGroupEntity,
        AttributeGroupDto
      >(attributes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[AttributeGroupDto[], number]> {
    try {
      const attributes = await this.attributeGroupRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<
        AttributeGroupEntity,
        AttributeGroupDto
      >(attributes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: AttributeGroupDto): Promise<AttributeGroupDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        AttributeGroupEntity,
        AttributeGroupDto
      >(dto);

      const product = await this.attributeGroupRepository.create(dtoToEntity);
      await this.attributeGroupRepository.save(product);

      return this.conversionService.toDto<
        AttributeGroupEntity,
        AttributeGroupDto
      >(product);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: AttributeGroupDto): Promise<AttributeGroupDto> {
    try {
      const attrGrp = await this.getAttributeGroup(id);

      const dtoToEntity = await this.conversionService.toEntity<
        AttributeGroupEntity,
        AttributeGroupDto
      >({ ...attrGrp, ...dto });

      const updatedDto = await this.attributeGroupRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<
        AttributeGroupEntity,
        AttributeGroupDto
      >(updatedDto);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const saveDto = await this.getAttributeGroup(id);

      const deleted = await this.attributeGroupRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<AttributeGroupDto> {
    try {
      const attributeGroup = await this.attributeGroupRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['attributes'] : [],
      });
      return this.conversionService.toDto<
        AttributeGroupEntity,
        AttributeGroupDto
      >(attributeGroup);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** relations ****************/
  async getAttributeGroup(id: string): Promise<AttributeGroupEntity> {
    const attributeGroup = await this.attributeGroupRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(attributeGroup, 'Feature Not Found!!');
    return attributeGroup;
  }
}
