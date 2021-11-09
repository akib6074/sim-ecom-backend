import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistrictService } from './district.service';
import {
  CountryEntity,
  CurrencyEntity,
  divisionsObject,
  isActive,
  Point,
  StateEntity,
} from '@simec/ecom-common';

@Injectable()
export class StateService {
  private readonly logger = new Logger(StateService.name);

  constructor(
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(StateEntity)
    private readonly stateRepository: Repository<StateEntity>,
    private readonly districtService: DistrictService,
  ) {}

  initStates = async (): Promise<boolean> => {
    await this.createBangladeshDivisions();
    return true;
  };

  createBangladeshDivisions = async (): Promise<boolean> => {
    try {
      const bangladesh = await this.countryRepository.findOne({
        name: 'Bangladesh',
        ...isActive,
      });
      const divisions = [];
      for (const divisionObject of divisionsObject) {
        const divisionEntity = this.generateStateEntity(divisionObject);
        const division = this.stateRepository.create(divisionEntity);
        division.country = bangladesh;
        division.districts = await this.districtService.createDistricts(
          divisionObject,
        );
        await this.stateRepository.save(division);
        divisions.push(division);
      }
      bangladesh.states = divisions;
      await this.countryRepository.save(bangladesh);
    } catch (error) {
      this.logger.log('error in catch block');
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

  generateStateEntity = (divisionObject: any): StateEntity => {
    const stateEntity = new StateEntity();
    stateEntity.createAt = new Date();
    stateEntity.updatedAt = new Date();
    stateEntity.name = divisionObject.name;
    stateEntity.location = new Point(divisionObject.lat, divisionObject.long);
    return stateEntity;
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
