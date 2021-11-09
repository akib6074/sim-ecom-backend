import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversionService,
  CreateResidentialAreaDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  ResidentialAreaDto,
  ResidentialAreaEntity,
  SystemException,
  ThanaEntity,
} from '@simec/ecom-common';

@Injectable()
export class ResidentialAreaService
  implements GeneralService<ResidentialAreaDto>
{
  constructor(
    @InjectRepository(ResidentialAreaEntity)
    private readonly residentialAreaRepository: Repository<ResidentialAreaEntity>,
    @InjectRepository(ThanaEntity)
    private readonly thanaRepository: Repository<ThanaEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<ResidentialAreaDto[]> {
    try {
      const residentialAreas = await this.residentialAreaRepository.find({
        where: {
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(residentialAreas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(
    residentialAreaDto: ResidentialAreaDto,
  ): Promise<ResidentialAreaDto[]> {
    try {
      const residentialAreas = await this.residentialAreaRepository.find({
        where: {
          ...residentialAreaDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(residentialAreas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ResidentialAreaDto[], number]> {
    try {
      const residentialAreas =
        await this.residentialAreaRepository.findAndCount({
          where: { ...isActive },
          skip: (page - 1) * limit,
          take: limit,
          order: {
            [sort !== 'undefined' ? sort : 'updatedAt']:
              sort !== 'undefined' ? order : 'DESC',
          },
        });

      return this.conversionService.toPagination<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(residentialAreas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByThana(id: string): Promise<ResidentialAreaDto[]> {
    try {
      const thana = await this.getThana(id);
      const residentialAreas = await this.residentialAreaRepository.find({
        where: {
          thana,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(residentialAreas);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateResidentialAreaDto): Promise<ResidentialAreaDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(dto);

      const residentialArea =
        this.residentialAreaRepository.create(dtoToEntity);
      residentialArea.thana = await this.getThana(dto.thanaID);
      await this.residentialAreaRepository.save(residentialArea);

      return this.conversionService.toDto<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(residentialArea);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(
    id: string,
    residentialAreaDto: CreateResidentialAreaDto,
  ): Promise<ResidentialAreaDto> {
    try {
      const savedResidentialArea = await this.getResidentialArea(id);
      if (residentialAreaDto.thanaID) {
        savedResidentialArea.thana = await this.getThana(
          residentialAreaDto.thanaID,
        );
      }

      const dtoToEntity = await this.conversionService.toEntity<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >({
        ...savedResidentialArea,
        ...residentialAreaDto,
      });

      const updatedResidentialArea = await this.residentialAreaRepository.save(
        dtoToEntity,
        {
          reload: true,
        },
      );
      return this.conversionService.toDto<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(updatedResidentialArea);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getResidentialArea(id);

      const deleted = await this.residentialAreaRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<ResidentialAreaDto> {
    try {
      const residentialArea = await this.residentialAreaRepository.findOne({
        id,
        ...isActive,
      });
      return this.conversionService.toDto<
        ResidentialAreaEntity,
        ResidentialAreaDto
      >(residentialArea);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/
  async getResidentialArea(id: string): Promise<ResidentialAreaEntity> {
    const residentialArea = await this.residentialAreaRepository.findOne({
      id,
      ...isActive,
    });
    this.exceptionService.notFound(
      residentialArea,
      'Residential Area Not Found!!',
    );
    return residentialArea;
  }

  async getThana(id: string): Promise<ThanaEntity> {
    const thana = await this.thanaRepository.findOne({
      id,
      ...isActive,
    });
    this.exceptionService.notFound(thana, 'Thana Not Found!!');
    return thana;
  }
  /*********************** End checking relations of post *********************/
}
