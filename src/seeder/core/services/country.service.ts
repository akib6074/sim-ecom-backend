import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyService } from './currency.service';
import {
  countriesObject,
  CountryEntity,
  CurrencyEntity,
  Point,
} from '@simec/ecom-common';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    private readonly currencyService: CurrencyService,
  ) {}

  initCountries = async (): Promise<boolean> => {
    await this.createCountries();
    return true;
  };

  createCountries = async (): Promise<boolean> => {
    try {
      for (const countryObject of countriesObject) {
        const countryEntity = this.generateCountryEntity(countryObject);
        const country = this.countryRepository.create(countryEntity);
        country.currency = await this.currencyService.createCurrency(
          countryObject,
        );
        await this.countryRepository.save(country);
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
    return true;
  };

  generateCountryEntity = (countryObject: any): CountryEntity => {
    const countryEntity = new CountryEntity();
    countryEntity.createAt = new Date();
    countryEntity.updatedAt = new Date();
    countryEntity.callPrefix = countryObject.callingCodes[0];
    countryEntity.isoCode = countryObject.alpha3Code;
    countryEntity.name = countryObject.name;
    countryEntity.location = new Point(
      countryObject.latlng[0],
      countryObject.latlng[1],
    );
    return countryEntity;
  };

  generateCurrencyEntity = (countryObject: any): CurrencyEntity => {
    const currencyEntity = new CurrencyEntity();
    currencyEntity.createAt = new Date();
    currencyEntity.updatedAt = new Date();
    currencyEntity.name = countryObject.currencies[0].name;
    currencyEntity.isoCode = countryObject.currencies[0].code;
    currencyEntity.symbol = countryObject.currencies[0].symbol;
    return currencyEntity;
  };
}
