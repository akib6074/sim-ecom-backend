import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CountryDto,
  CountryEntity,
  CreateCountryDto,
  CurrencyEntity,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class CountryService implements GeneralService<CountryDto> {
  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<CountryDto[]> {
    try {
      const countries = await this.countryRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<CountryEntity, CountryDto>(
        countries,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(countryDto: CountryDto): Promise<CountryDto[]> {
    try {
      const countries = await this.countryRepository.find({
        where: {
          ...countryDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<CountryEntity, CountryDto>(
        countries,
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
  ): Promise<[CountryDto[], number]> {
    try {
      const countries = await this.countryRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<CountryEntity, CountryDto>(
        countries,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByCurrency(id: string): Promise<CountryDto[]> {
    try {
      const currency = await this.getCurrency(id);
      const countries = await this.countryRepository.find({
        where: {
          currency,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<CountryEntity, CountryDto>(
        countries,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateCountryDto): Promise<CountryDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        CountryEntity,
        CountryDto
      >(dto);

      const country = this.countryRepository.create(dtoToEntity);
      country.currency = await this.getCurrency(dto.currencyID);
      await this.countryRepository.save(country);

      return this.conversionService.toDto<CountryEntity, CountryDto>(country);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateCountryDto): Promise<CountryDto> {
    try {
      const saveDto = await this.getCountry(id);
      if (dto.currencyID)
        saveDto.currency = await this.getCurrency(dto.currencyID);

      const dtoToEntity = await this.conversionService.toEntity<
        CountryEntity,
        CountryDto
      >({ ...saveDto, ...dto });

      const updatedCountry = await this.countryRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<CountryEntity, CountryDto>(
        updatedCountry,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getCountry(id);

      const deleted = await this.countryRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<CountryDto> {
    try {
      const country = await this.countryRepository.findOne(
        {
          id,
          ...isActive,
        },
        {
          relations: relation ? ['states'] : [],
        },
      );
      return this.conversionService.toDto<CountryEntity, CountryDto>(country);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/
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

  async getCurrency(id: string): Promise<CurrencyEntity> {
    const currency = await this.currencyRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(currency, 'Currency Not Found!!');
    return currency;
  }

  /*********************** End checking relations of post *********************/
}
