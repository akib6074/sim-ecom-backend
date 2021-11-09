import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AddressEntity,
  AffiliatorEntity,
  BcryptService,
  CountryEntity,
  CreateUserDto,
  CustomerEntity,
  DistrictEntity,
  EmployeeEntity,
  isActive,
  MerchantEntity,
  ProfileEntity,
  RoleEntity,
  RoleName,
  ThanaEntity,
  UserEntity,
  UserRoleEntity,
  usersObject,
} from '@simec/ecom-common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(MerchantEntity)
    private readonly merchantRepository: Repository<MerchantEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(AffiliatorEntity)
    private readonly affiliatorRepository: Repository<AffiliatorEntity>,
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    @InjectRepository(ThanaEntity)
    private readonly thanaRepository: Repository<ThanaEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    private bcryptService: BcryptService,
  ) {}

  async count(): Promise<number> {
    return await this.userRepository.count();
  }

  async initUsers(): Promise<boolean> {
    await this.createUsers(usersObject);
    return true;
  }

  async createUsers(users: any[]): Promise<boolean> {
    try {
      for (const userObject of users) {
        await this.createUser(userObject);
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
    return true;
  }

  async createUser(userObject: any): Promise<boolean> {
    const userEntity = await this.generateUserEntity(userObject);
    const user = this.userRepository.create(userEntity);
    user.address = await this.generateAddress(user);
    const profile = this.profileRepository.create(this.generateProfileEntity());
    profile.profileImageUrl = '/assets/images/user-profile.png';
    profile.coverImageUrl = '/assets/images/profile-cover.png';
    await this.profileRepository.save(profile);
    user.profile = profile;

    let role = null;
    switch (userObject.role as RoleName) {
      case RoleName.SUPER_ADMIN_ROLE: {
        role = await this.roleRepository.findOne({
          role: RoleName.SUPER_ADMIN_ROLE,
          ...isActive,
        });
        break;
      }
      case RoleName.ADMIN_ROLE: {
        role = await this.roleRepository.findOne({
          role: RoleName.ADMIN_ROLE,
          ...isActive,
        });
        break;
      }
      case RoleName.CUSTOMER_ROLE: {
        role = await this.roleRepository.findOne({
          role: RoleName.CUSTOMER_ROLE,
          ...isActive,
        });
        user.customer = await this.createCustomer(user);
        break;
      }
      case RoleName.MERCHANT_ROLE: {
        role = await this.roleRepository.findOne({
          role: RoleName.MERCHANT_ROLE,
          ...isActive,
        });
        user.merchant = await this.createMerchant();
        user.customer = await this.createCustomer(user);
        break;
      }
      case RoleName.USER_ROLE: {
        role = await this.roleRepository.findOne({
          role: RoleName.USER_ROLE,
          ...isActive,
        });
        user.customer = await this.createCustomer(user);
        break;
      }
      case RoleName.EMPLOYEE_ROLE: {
        role = await this.roleRepository.findOne({
          role: RoleName.EMPLOYEE_ROLE,
          ...isActive,
        });
        user.employee = await this.createEmployee();
        break;
      }
      case RoleName.AFFILIATOR_ROLE: {
        role = await this.roleRepository.findOne({
          role: RoleName.AFFILIATOR_ROLE,
          ...isActive,
        });
        user.affiliator = await this.createAffiliator();
        break;
      }
    }
    await this.userRepository.save(user);

    const userRole = new UserRoleEntity();
    userRole.user = user;
    userRole.role = role;
    await this.userRoleRepository.save(userRole);

    if (userObject.role === RoleName.MERCHANT_ROLE) {
      const userRole = new UserRoleEntity();
      userRole.user = user;
      userRole.role = await this.roleRepository.findOne({
        role: RoleName.CUSTOMER_ROLE,
        ...isActive,
      });
      await this.userRoleRepository.save(userRole);
    }
    return true;
  }

  generateAddress = async (user: UserEntity): Promise<AddressEntity> => {
    const country = await this.countryRepository.findOne({
      where: {
        isoCode: 'BGD',
        ...isActive,
      },
    });

    const query = this.districtRepository.createQueryBuilder('district');

    const district = await query
      .innerJoinAndSelect('district.state', 'state')
      .where('district.name = :name and district.isActive = :isActive', {
        name: 'Dhaka',
        ...isActive,
      })
      .getOne();

    const thana = await this.thanaRepository.findOne({
      where: {
        name: 'Savar Upazila',
        ...isActive,
      },
    });
    const state = district.state;
    const address = new AddressEntity();
    address.country = country;
    address.district = district;
    address.state = state;
    address.thana = thana;
    address.address = 'H#2, R#4, Housing state, Hemayetpur';
    address.alias = 'My Alias';
    address.firstname = user.firstName;
    address.lastname = user.lastName;
    await this.addressRepository.save(address);
    return address;
  };

  async createCustomer(user: UserEntity): Promise<CustomerEntity> {
    const customerEntity = new CustomerEntity();
    customerEntity.createAt = new Date();
    customerEntity.updatedAt = new Date();
    customerEntity.outstandingAllowAmount = 5000.0;
    customerEntity.maxPaymentDays = 15.0;
    customerEntity.billingAddress = user.address;
    customerEntity.shippingAddresses = [];
    customerEntity.shippingAddresses.push(customerEntity.billingAddress);
    const customer = this.customerRepository.create(customerEntity);
    await this.customerRepository.save(customer);
    return customer;
  }

  async createMerchant(): Promise<MerchantEntity> {
    const merchantDto = new MerchantEntity();
    merchantDto.createAt = new Date();
    merchantDto.updatedAt = new Date();
    const merchant = this.merchantRepository.create(merchantDto);
    await this.merchantRepository.save(merchant);
    return merchant;
  }

  async createEmployee(): Promise<EmployeeEntity> {
    const employeeEntity = new EmployeeEntity();
    employeeEntity.createAt = new Date();
    employeeEntity.updatedAt = new Date();
    const employee = this.employeeRepository.create(employeeEntity);
    await this.employeeRepository.save(employee);
    return employee;
  }

  async createAffiliator(): Promise<AffiliatorEntity> {
    const affiliatorEntity = new AffiliatorEntity();
    affiliatorEntity.createAt = new Date();
    affiliatorEntity.updatedAt = new Date();
    affiliatorEntity.baseFee = 0.0;
    affiliatorEntity.clickFee = 0.0;
    affiliatorEntity.percentFee = 0.0;
    const affiliator = this.affiliatorRepository.create(affiliatorEntity);
    await this.affiliatorRepository.save(affiliator);
    return affiliator;
  }

  generateProfileEntity(): ProfileEntity {
    const profile = new ProfileEntity();
    profile.createAt = new Date();
    profile.updatedAt = new Date();
    profile.profileImageUrl = 'default_profile.png';
    return profile;
  }

  async generateUserEntity(userObject: any): Promise<UserEntity> {
    const user = new UserEntity();
    user.createAt = new Date();
    user.updatedAt = new Date();
    user.firstName = userObject.firstName;
    user.lastName = userObject.lastName;
    user.email = userObject.email;
    user.phone = userObject.phone;
    user.password = await this.bcryptService.hashPassword(userObject.password);
    user.gender = userObject.gender;
    user.dateOfBirth = userObject.dateOfBirth;
    return user;
  }
}
