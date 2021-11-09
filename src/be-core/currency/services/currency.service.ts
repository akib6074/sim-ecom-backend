import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CurrencyDto,
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
export class CurrencyService implements GeneralService<CurrencyDto> {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<CurrencyDto[]> {
    try {
      const currencies = await this.currencyRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<CurrencyEntity, CurrencyDto>(
        currencies,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(currencyDto: CurrencyDto): Promise<CurrencyDto[]> {
    try {
      const currencies = await this.currencyRepository.find({
        where: {
          ...currencyDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<CurrencyEntity, CurrencyDto>(
        currencies,
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
  ): Promise<[CurrencyDto[], number]> {
    try {
      const currencies = await this.currencyRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<CurrencyEntity, CurrencyDto>(
        currencies,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CurrencyDto): Promise<CurrencyDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        CurrencyEntity,
        CurrencyDto
      >(dto);

      const currency = this.currencyRepository.create(dtoToEntity);
      await this.currencyRepository.save(currency);

      return this.conversionService.toDto<CurrencyEntity, CurrencyDto>(
        currency,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CurrencyDto): Promise<CurrencyDto> {
    try {
      const saveDto = await this.getCurrency(id);

      const dtoToEntity = await this.conversionService.toEntity<
        CurrencyEntity,
        CurrencyDto
      >({ ...saveDto, ...dto });

      const updatedCurrency = await this.currencyRepository.save(dtoToEntity, {
        reload: true,
      });

      return this.conversionService.toDto<CurrencyEntity, CurrencyDto>(
        updatedCurrency,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getCurrency(id);

      const deleted = await this.currencyRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<CurrencyDto> {
    try {
      const currency = await this.getCurrency(id);
      return this.conversionService.toDto<CurrencyEntity, CurrencyDto>(
        currency,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/

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
