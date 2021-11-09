import { plainToClass } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AttributeDto,
  AttributeEntity,
  AttributeGroupEntity,
  ConversionService,
  CreateAttributeDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class AttributeService implements GeneralService<AttributeDto> {
  constructor(
    @InjectRepository(AttributeEntity)
    private readonly attributeRepository: Repository<AttributeEntity>,
    @InjectRepository(AttributeGroupEntity)
    private readonly attributeGroupRepository: Repository<AttributeGroupEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<AttributeDto[]> {
    try {
      const attributes = await this.attributeRepository.find({
        where: { ...isActive },
        relations: ['attributeGroup'],
      });
      //return this.plainToClass(AttributeEntity,AttributeDto)
      return this.conversionService.toDtos<AttributeEntity, AttributeDto>(
        attributes,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: AttributeDto): Promise<AttributeDto[]> {
    try {
      const attributes = await this.attributeRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<AttributeEntity, AttributeDto>(
        attributes,
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
  ): Promise<[AttributeDto[], number]> {
    try {
      const attributes = await this.attributeRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<AttributeEntity, AttributeDto>(
        attributes,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByAttributeGroup(id: string): Promise<AttributeDto[]> {
    try {
      const attributeGroup = await this.getAttributeGroup(id);

      const attributeGroups = await this.attributeRepository.find({
        where: {
          attributeGroup,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<AttributeEntity, AttributeDto>(
        attributeGroups,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateAttributeDto): Promise<AttributeDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        AttributeEntity,
        AttributeDto
      >(dto);

      const attribute = this.attributeRepository.create(dtoToEntity);
      attribute.attributeGroup = await this.getAttributeGroup(
        dto.attributeGroupID,
      );

      await this.attributeRepository.save(attribute);
      return this.conversionService.toDto<AttributeEntity, AttributeDto>(
        attribute,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateAttributeDto): Promise<AttributeDto> {
    try {
      const attribute = await this.getAttribute(id);

      if (dto.attributeGroupID)
        attribute.attributeGroup = await this.getAttributeGroup(
          dto.attributeGroupID,
        );

      const dtoToEntity = await this.conversionService.toEntity<
        AttributeEntity,
        AttributeDto
      >({ ...attribute, ...dto });

      const updatedAttribute = await this.attributeRepository.save(
        dtoToEntity,
        {
          reload: true,
        },
      );
      return this.conversionService.toDto<AttributeEntity, AttributeDto>(
        updatedAttribute,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const saveDto = await this.getAttribute(id);

      const deleted = await this.attributeRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<AttributeDto> {
    try {
      const attribute = await this.attributeRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['attributeGroup', 'productAttributes'] : [],
      });
      return this.conversionService.toDto<AttributeEntity, AttributeDto>(
        attribute,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** relations *************************/
  async getAttribute(id: string): Promise<AttributeEntity> {
    const attribute = await this.attributeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(attribute, 'Attribute Not Found!!');
    return attribute;
  }

  async getAttributeGroup(id: string): Promise<AttributeGroupEntity> {
    const attributeGrp = await this.attributeGroupRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(attributeGrp, 'Attribute Group Not Found!!');
    return attributeGrp;
  }
}
