import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from '@simec/ecom-common';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
  ) {}

  createCurrency = async (countryObject: any): Promise<CurrencyEntity> => {
    const currencyEntity = this.generateCurrencyEntity(countryObject);
    const currency = this.currencyRepository.create(currencyEntity);
    await this.currencyRepository.save(currency);
    return currency;
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
