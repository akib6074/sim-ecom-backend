import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CategoryEntity,
  CountryEntity,
  DistrictEntity,
  isActive,
  MerchantEntity,
  ResidentialAreaEntity,
  ShopEntity,
  ShopTypeEntity,
  StateEntity,
  ThanaEntity,
  UserEntity,
} from '@simec/ecom-common';

@Injectable()
export class CommonFakerService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CountryEntity)
    private countryRepository: Repository<CountryEntity>,
    @InjectRepository(StateEntity)
    private stateRepository: Repository<StateEntity>,
    @InjectRepository(DistrictEntity)
    private districtRepository: Repository<DistrictEntity>,
    @InjectRepository(ThanaEntity)
    private thanaRepository: Repository<ThanaEntity>,
    @InjectRepository(ResidentialAreaEntity)
    private residentialAreaRepository: Repository<ResidentialAreaEntity>,
    @InjectRepository(MerchantEntity)
    private merchantRepository: Repository<MerchantEntity>,
    @InjectRepository(ShopEntity)
    private shopRepository: Repository<ShopEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ShopTypeEntity)
    private typeRepository: Repository<ShopTypeEntity>,
  ) {}

  findUsers = async (): Promise<UserEntity[]> => {
    return await this.userRepository.find();
  };

  findBangladesh = async (): Promise<CountryEntity> => {
    return await this.countryRepository.findOne({
      name: 'Bangladesh',
    });
  };

  findState = async (country: CountryEntity): Promise<StateEntity[]> => {
    return await this.stateRepository.find({
      country,
    });
  };

  findDistrict = async (state: StateEntity): Promise<DistrictEntity[]> => {
    return await this.districtRepository.find({
      state,
    });
  };

  findThana = async (district: DistrictEntity): Promise<ThanaEntity[]> => {
    return await this.thanaRepository.find({
      district,
    });
  };

  findResidentialArea = async (
    thana: ThanaEntity,
  ): Promise<ResidentialAreaEntity[]> => {
    return await this.residentialAreaRepository.find({
      thana,
    });
  };

  getUsers = async (): Promise<UserEntity[]> => {
    return await this.userRepository.find({ ...isActive });
  };

  getMerchants = async (): Promise<MerchantEntity[]> => {
    return await this.merchantRepository.find({ ...isActive });
  };

  getShops = async (): Promise<ShopEntity[]> => {
    return await this.shopRepository.find({ ...isActive });
  };

  getShopTypes = async (): Promise<ShopTypeEntity[]> => {
    return await this.typeRepository.find({ ...isActive });
  };

  getCategories = async (): Promise<CategoryEntity[]> => {
    return await this.categoryRepository.find({
      where: { ...isActive },
    });
  };
}
