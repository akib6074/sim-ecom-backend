import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
  ConfigurationDto,
  ConfigurationEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class ConfigurationService implements GeneralService<ConfigurationDto> {
  constructor(
    @InjectRepository(ConfigurationEntity)
    private readonly configurationRepository: Repository<ConfigurationEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<ConfigurationDto[]> {
    try {
      const allConfigurations = await this.configurationRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<
        ConfigurationEntity,
        ConfigurationDto
      >(allConfigurations);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(
    configurationDto: ConfigurationDto,
  ): Promise<ConfigurationDto[]> {
    try {
      const allConfigurations = await this.configurationRepository.find({
        where: {
          ...configurationDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        ConfigurationEntity,
        ConfigurationDto
      >(allConfigurations);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ConfigurationDto[], number]> {
    try {
      const allConfigurations = await this.configurationRepository.findAndCount(
        {
          where: { ...isActive },
          skip: (page - 1) * limit,
          take: limit,
          order: {
            [sort !== 'undefined' ? sort : 'updatedAt']:
              sort !== 'undefined' ? order : 'DESC',
          },
        },
      );

      return this.conversionService.toPagination<
        ConfigurationEntity,
        ConfigurationDto
      >(allConfigurations);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: ConfigurationDto): Promise<ConfigurationDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        ConfigurationEntity,
        ConfigurationDto
      >(dto);

      const configuration = this.configurationRepository.create(dtoToEntity);
      await this.configurationRepository.save(configuration);
      return this.conversionService.toDto<ConfigurationEntity, ConfigurationDto>(configuration);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: ConfigurationDto): Promise<ConfigurationDto> {
    try {
      const saveDto = await this.getConfiguration(id);

      const dtoToEntity = await this.conversionService.toEntity<
      ConfigurationEntity,
        ConfigurationDto
      >({ ...saveDto, ...dto });

      const updatedConfiguration = await this.configurationRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<ConfigurationEntity, ConfigurationDto>(updatedConfiguration);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getConfiguration(id);

      const deleted = await this.configurationRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<ConfigurationDto> {
    try {
      const configuration = await this.getConfiguration(id);
      return this.conversionService.toDto<ConfigurationEntity, ConfigurationDto>(configuration);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/

  async getConfiguration(id: string): Promise<ConfigurationEntity> {
    const configuration = await this.configurationRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(configuration, 'Configuration Not Found!!');
    return configuration;
  }
  /*********************** End checking relations of post *********************/
}
