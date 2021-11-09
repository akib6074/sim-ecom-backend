import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './services/role.service';
import { UserSeederService } from './services/user-seeder.service';
import { UserService } from './services/user.service';
import {
  AddressEntity,
  AffiliatorEntity,
  BcryptService,
  CountryEntity,
  CustomerEntity,
  DistrictEntity,
  EmployeeEntity,
  ExceptionService,
  MerchantEntity,
  ProfileEntity,
  RoleEntity,
  StateEntity,
  ThanaEntity,
  UserEntity,
  UserRoleEntity,
} from '@simec/ecom-common';

const services = [
  BcryptService,
  UserService,
  UserSeederService,
  RoleService,
  ExceptionService,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      UserRoleEntity,
      ProfileEntity,
      CustomerEntity,
      AffiliatorEntity,
      MerchantEntity,
      EmployeeEntity,
      CountryEntity,
      DistrictEntity,
      ThanaEntity,
      StateEntity,
      AddressEntity,
    ]),
  ],
  controllers: [],
  providers: [...services],
  exports: [...services],
})
export class UserSeederModule {}
