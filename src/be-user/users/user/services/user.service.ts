import { HttpService, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ActiveStatus,
  AddressEntity,
  AddUserRoleDto,
  AffiliatorEntity,
  BcryptService,
  ChangePasswordDto,
  ConversionService,
  CountryEntity,
  CreateOtpDto,
  CreateUserDto,
  CustomerEntity,
  DeleteDto,
  DistrictEntity,
  EmployeeEntity,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  MailParserDto,
  MerchantEntity,
  OtpDto,
  PhoneOrEmailDto,
  ProfileEntity,
  RequestService,
  RoleEntity,
  RoleName,
  SystemException,
  ThanaEntity,
  UserDto,
  UserEntity,
  UserRoleDto,
  UserRoleEntity,
  UserType,
  PermissionService,
  MailFromDto,
  ResetPasswordDto,
  NotificationDto,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService implements GeneralService<UserDto> {
  private readonly logger = new Logger(UserService.name);
  private readonly notificationClient: ClientProxy;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(AffiliatorEntity)
    private readonly affiliatorRepository: Repository<AffiliatorEntity>,
    @InjectRepository(MerchantEntity)
    private readonly merchantRepository: Repository<MerchantEntity>,
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    @InjectRepository(ThanaEntity)
    private readonly thanaRepository: Repository<ThanaEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly bcryptService: BcryptService,
    private readonly requestService: RequestService,
    private readonly permissionService: PermissionService,
    private readonly httpService: HttpService,
  ) {
    this.notificationClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { url: configService.get('NOTIFICATION_SERVICE_URL') },
    });
  }

  findAll = async (): Promise<UserDto[]> => {
    try {
      const users = await this.userRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<UserEntity, UserDto>(users);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findById = async (id: string, relation = true): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        where: { id, ...isActive },
        relations: relation
          ? [
              'profile',
              'merchant',
              'customer',
              'employee',
              'affiliator',
              'address',
              'roles',
            ]
          : [],
      });
      this.exceptionService.notFound(user, 'User is not found');
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findInactiveUserById = async (
    id: string,
    relation = true,
  ): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: relation
          ? [
              'profile',
              'merchant',
              'customer',
              'employee',
              'affiliator',
              'address',
              'roles',
            ]
          : [],
      });
      this.exceptionService.notFound(user, 'User is not found');
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  getWishListByUserId = async (): Promise<UserDto> => {
    try {
      const id = this.permissionService.returnRequest().userId;
      const user = await this.userRepository.findOne({
        where: { id, ...isActive },
        relations: ['wishlist'],
      });
      this.exceptionService.notFound(user, 'User is not found');
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  getFollowingShopsByUserId = async (): Promise<UserDto> => {
    try {
      const id = this.permissionService.returnRequest().userId;
      const user = await this.userRepository.findOne({
        where: { id, ...isActive },
        relations: ['followingShops'],
      });
      this.exceptionService.notFound(user, 'User is not found');
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  getProfileByUserId = async (
    id: string,
    relation = true,
  ): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        where: { id, ...isActive },
        relations: relation
          ? [
              'profile',
              'address',
              'address.country',
              'address.district',
              'address.thana',
            ]
          : [],
      });
      this.exceptionService.notFound(user, 'User is not found');
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findByObject = async (dto: UserDto): Promise<UserDto[]> => {
    try {
      const users = await this.userRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<UserEntity, UserDto>(users);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findOne = async (dto: UserDto): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        where: {
          ...dto,
          ...isActive,
        },
      });
      this.exceptionService.notFound(user, 'User is not found');
      return await this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findOneByEmailOrPhone = async (emailOrPhone: string): Promise<UserDto> => {
    try {
      const query = this.userRepository.createQueryBuilder('user');

      const user = await query
        .where(
          '(user.phone = :phone OR user.email = :email) and user.isActive = :isActive',
          {
            phone: emailOrPhone,
            email: emailOrPhone,
            ...isActive,
          },
        )
        .getOne();

      this.exceptionService.notFound(
        user,
        'User is not found by phone or email',
      );

      return await this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findRolesByUserId = async (id: string): Promise<UserRoleDto[]> => {
    try {
      const query = this.userRoleRepository.createQueryBuilder('userRole');
      const userRoles = await query
        .innerJoin('userRole.user', 'user', 'user.id=:id', { id })
        .innerJoinAndSelect('userRole.role', 'role')
        .leftJoinAndSelect('userRole.shop', 'shop')
        .getMany();
      this.logger.log(JSON.stringify(userRoles));
      return this.conversionService.toDtos<UserRoleEntity, UserRoleDto>(
        userRoles,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  };

  findAllMerchant = async (): Promise<UserDto[]> => {
    try {
      const query = this.userRepository.createQueryBuilder('users');

      const users = await query
        .innerJoinAndSelect('users.merchant', 'merchant')
        .where('users.isActive = :isActive', { ...isActive })
        .andWhere('users.merchant IS NOT NULL')
        .getMany();

      this.exceptionService.notFound(users, 'No merchant found!!');

      return this.conversionService.toDtos<UserEntity, UserDto>(users);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  create = async (createUserDto: CreateUserDto): Promise<any> => {
    try {
      const response = createUserDto.captcha;
      const secretKey = this.configService.get('SECRET_KEY');
      const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${response}`;
      const res = (await this.httpService.get(url).toPromise()) as any;
      // console.log(res.data);
      if (res.data?.success === true) {
        const user = await this.createUser(createUserDto);
        return this.conversionService.toDto<UserEntity, UserDto>(user);
      } else {
        throw new SystemException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Recaptcha Error!!',
        });
      }
    } catch (error) {
      throw new SystemException(error);
    }
  };

  sendOtpByMail = async (createOtpDto: CreateOtpDto, userId: string) => {
    const parseMailFrom = new MailFromDto();
    parseMailFrom.address = this.configService.get('MAIL_NO_REPLY_USER');
    parseMailFrom.name = 'EBONEAR';

    const parseMail = new MailParserDto();
    parseMail.from = parseMailFrom;
    parseMail.to = createOtpDto.email;
    parseMail.subject = 'Otp for registration';
    parseMail.html =
      '<div style="padding: 2rem 0rem 2rem 0rem; background-color: #e1e5e8; height: 100%">' +
      '<div style="padding: 1rem 1rem 1rem 1rem; text-align: center;border-radius: 2px;background-color: #ffffff; margin-right: 15rem;margin-left: 15rem;">' +
      '<p style="text-align: center; font-size: 1.5rem; color: #2b2b2b">Welcome To Ebonear! You are just one step away from register</p>' +
      '<img style="text-align: center; margin-top: 1.5rem" src=""/>' +
      '<p style="margin-top: 3rem; text-align: start">We are exited to have you get started. First you need to confirm your account. An OTP (One Time Passowrd) is attached with this e-mail. Fill up with the following OTP.</p>' +
      '<p style="margin-top: 1rem; text-align: center">' +
      createOtpDto.otp +
      '</p>' +
      '<p style="margin-top: 3rem; text-align: start">You can verify OTP later by using the following link.</p>' +
      '<p style="font-style: italic;margin-top: 1rem; text-align: center">' +
      this.configService.get('VERIFICATION_MAIL_LINK') +
      '/' +
      userId +
      '</p>' +
      '</div>' +
      '</div>';
    this.logger.log(parseMail);
    this.notificationClient
      .emit(
        { service: 'mail', cmd: 'post', method: 'sendNoReplyMailMessage' },
        parseMail,
      )
      .pipe(timeout(5000))
      .subscribe();
  };

  createNotification = async (notificationDto: NotificationDto) => {
    this.notificationClient
      .emit(
        {
          service: 'notification',
          cmd: 'create',
          method: 'createNotification',
        },
        notificationDto,
      )
      .pipe(timeout(5000))
      .subscribe();
  };

  notificationMailToAdmin = async (
    email: string,
    notificationDto: NotificationDto,
  ) => {
    const parseMailFrom = new MailFromDto();
    parseMailFrom.address = this.configService.get('MAIL_ADMIN_USER');
    parseMailFrom.name = 'EBONEAR';

    const parseMail = new MailParserDto();
    parseMail.from = parseMailFrom;
    parseMail.to = email;
    parseMail.subject = 'New Merchant Registration';
    parseMail.html =
      '<div style="padding: 2rem 0rem 2rem 0rem; background-color: #e1e5e8; height: 100%">' +
      '<div style="padding: 1rem 1rem 1rem 1rem; text-align: center;border-radius: 2px;background-color: #ffffff; margin-right: 15rem;margin-left: 15rem;">' +
      '<p style="text-align: center; font-size: 1.5rem; color: #2b2b2b">Welcome To Ebonear!</p>' +
      '<img style="text-align: center; margin-top: 1.5rem" src=""/>' +
      '<p style="margin-top: 3rem; text-align: start">' +
      notificationDto.message +
      '</p>' +
      '</div>' +
      '</div>';
    this.logger.log('️‍🔥️‍🔥️‍🔥️‍🔥️‍🔥' + parseMail);
    this.notificationClient
      .emit(
        {
          service: 'mail',
          cmd: 'post',
          method: 'sendAdminMailMessage',
        },
        parseMail,
      )
      .pipe(timeout(5000))
      .subscribe();
  };

  sendOtpBySms = async (createOtpDto: CreateOtpDto) => {
    this.notificationClient
      .emit({ service: 'sms', cmd: 'post', method: 'sendSMS' }, createOtpDto)
      .pipe(timeout(5000))
      .subscribe();
  };

  resendOtp = async (userId: string) => {
    const user = await this.userRepository.findOne(userId);
    const createOtp = new CreateOtpDto();
    createOtp.email = user.email;
    createOtp.phone = user.phone;
    createOtp.otp = user.otp;

    await this.sendOtpByMail(createOtp, userId);
    await this.sendOtpBySms(createOtp);
  };

  update = async (id: string, dto: CreateUserDto): Promise<UserDto> => {
    try {
      const saveDto = await this.getUserAndProfile(id);
      dto = this.requestService.forUpdate(dto);

      const user = await this.conversionService.toEntity<UserEntity, UserDto>({
        ...saveDto,
        ...dto,
      });
      user.address = await this.generateAddress(dto);
      user.profile.profileImageUrl = dto.profileImageUrl;
      await this.profileRepository.save(user.profile);
      const updatedUser = await this.userRepository.save(user, {
        reload: true,
      });

      return this.conversionService.toDto<UserEntity, UserDto>(updatedUser);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  updatePasswordToken = async (
    phoneOrEmailDto: PhoneOrEmailDto,
  ): Promise<UserDto> => {
    try {
      const query = this.userRepository.createQueryBuilder('user');

      const savedUser = await query
        .where(
          '(user.phone = :phone OR user.email = :email) and user.isActive = :isActive',
          {
            phone: phoneOrEmailDto.phoneOrEmail,
            email: phoneOrEmailDto.phoneOrEmail,
            ...isActive,
          },
        )
        .getOne();
      this.exceptionService.notFound(savedUser, 'User is not found');

      savedUser.resetPasswordToken = uuidv4();

      const tomorrow = new Date();
      tomorrow.setDate(new Date().getDate() + 1);
      savedUser.resetPasswordValidity = tomorrow;

      const updatedUser = await this.userRepository.save(
        {
          ...savedUser,
        },
        {
          reload: true,
        },
      );
      return this.conversionService.toDto<UserEntity, UserDto>(updatedUser);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  updatePassword = async (
    changePasswordDto: ChangePasswordDto,
  ): Promise<UserDto> => {
    try {
      const savedUser = await this.userRepository.findOne({
        resetPasswordToken: changePasswordDto.token,
        ...isActive,
      });

      this.exceptionService.notFound(savedUser, 'User is not found');
      savedUser.password = await this.bcryptService.hashPassword(
        changePasswordDto.newPassword,
      );

      const updatedUser = await this.userRepository.save(
        {
          ...savedUser,
        },
        {
          reload: true,
        },
      );
      return this.conversionService.toDto<UserEntity, UserDto>(updatedUser);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  resetPassword = async (
    resetPasswordDto: ResetPasswordDto,
  ): Promise<UserDto> => {
    try {
      const id = this.permissionService.returnRequest().userId;
      const savedUser = await this.userRepository.findOne({
        where: { id, ...isActive },
      });

      if (
        this.bcryptService.comparePassword(
          resetPasswordDto.presentPassword,
          savedUser.password,
        )
      ) {
        this.exceptionService.notFound(savedUser, 'User is not found');
        savedUser.password = await this.bcryptService.hashPassword(
          resetPasswordDto.newPassword,
        );

        const updatedUser = await this.userRepository.save(
          {
            ...savedUser,
          },
          {
            reload: true,
          },
        );
        return this.conversionService.toDto<UserEntity, UserDto>(updatedUser);
      } else {
        const error = { message: 'Please enter correct password!' };
        throw new SystemException(error);
      }
    } catch (error) {
      throw new SystemException(error);
    }
  };

  verifyOtp = async (id: string, otp: OtpDto): Promise<OtpDto> => {
    const userOtp = await this.userRepository.findOne({ id, ...otp });
    this.exceptionService.notFound(userOtp, 'Otp mismatched resend');
    if (userOtp) {
      userOtp.isActive = 1;
      userOtp.otp = 0;
    }
    await this.userRepository.save(userOtp);

    return this.conversionService.toDto<UserEntity, UserDto>(userOtp);
  };

  remove = async (id: string): Promise<DeleteDto> => {
    try {
      const saveDto = await this.getUser(id);

      const deleted = await this.userRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  };

  pagination = async (
    page: number,
    limit: number,
  ): Promise<[UserDto[], number]> => {
    try {
      const user = await this.userRepository.find({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: { updatedAt: 'DESC' },
      });

      const total = await this.userRepository.count();

      return this.conversionService.toPagination<UserEntity, UserDto>([
        user,
        total,
      ]);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  /****************** helper ************/

  generateProfileEntity = async (): Promise<ProfileEntity> => {
    let profileEntity = new ProfileEntity();
    profileEntity = this.requestService.forCreate(profileEntity);
    profileEntity.profileImageUrl = '/assets/images/user-profile.png';
    profileEntity.coverImageUrl = '/assets/images/profile-cover.png';
    const profile = this.profileRepository.create(profileEntity);
    await this.profileRepository.save(profile);
    return profile;
  };

  generateUserRoleEntity = async (
    roleName: RoleName,
    user: UserEntity,
  ): Promise<UserEntity> => {
    let userRole = new UserRoleEntity();
    userRole.user = user;
    userRole.role = await this.getRoleByName(roleName);
    userRole = this.requestService.forCreate(userRole);

    await this.userRoleRepository.save(userRole);
    return Promise.resolve(user);
  };

  generateCustomerEntity = async (
    user: UserEntity,
    sendOtp = false,
  ): Promise<void> => {
    let cusEntity = new CustomerEntity();
    cusEntity.outstandingAllowAmount = 5000.0;
    cusEntity.maxPaymentDays = 15.0;
    cusEntity = this.requestService.forCreate(cusEntity);
    const customer = this.customerRepository.create(cusEntity);
    customer.billingAddress = user.address;
    customer.shippingAddresses = [];
    customer.shippingAddresses.push(customer.billingAddress);
    await this.customerRepository.save(customer);
    user.customer = customer;
    user.isActive = 0;
    user.otp = this.otpGenerator();

    const savedUser = await this.userRepository.save(user);

    if (savedUser && sendOtp) {
      const createOtp = new CreateOtpDto();
      createOtp.email = user.email;
      createOtp.phone = user.phone;
      createOtp.otp = user.otp;

      await this.sendOtpByMail(createOtp, savedUser.id);
      await this.sendOtpBySms(createOtp);
    }
  };

  generateMerchantEntity = async (user: UserEntity): Promise<void> => {
    let merEntity = new MerchantEntity();
    merEntity = this.requestService.forCreate(merEntity);

    const merchant = this.merchantRepository.create(merEntity);
    await this.merchantRepository.save(merchant);
    user.merchant = merchant;
    user.isActive = 0;
    user.otp = this.otpGenerator();

    const savedUser = await this.userRepository.save(user);

    if (savedUser) {
      const createOtp = new CreateOtpDto();
      createOtp.email = user.email;
      createOtp.phone = user.phone;
      createOtp.otp = user.otp;

      await this.sendOtpByMail(createOtp, savedUser.id);
      await this.sendOtpBySms(createOtp);
    }
  };

  generateEmployeeEntity = async (user: UserEntity): Promise<void> => {
    let employeeEntity = new EmployeeEntity();
    employeeEntity = this.requestService.forCreate(employeeEntity);

    const employee = this.employeeRepository.create(employeeEntity);
    await this.employeeRepository.save(employee);
    user.employee = employee;
    await this.userRepository.save(user);
  };

  generateAffiliatorEntity = async (user: UserEntity): Promise<void> => {
    let affiliatorEntity = new AffiliatorEntity();
    affiliatorEntity.baseFee = 0.0;
    affiliatorEntity.clickFee = 0.0;
    affiliatorEntity.percentFee = 0.0;
    affiliatorEntity = this.requestService.forCreate(affiliatorEntity);

    const affiliator = this.affiliatorRepository.create(affiliatorEntity);
    await this.affiliatorRepository.save(affiliator);
    user.affiliator = affiliator;
    await this.userRepository.save(user);
  };

  generateAddress = async (
    createUserDto: CreateUserDto,
  ): Promise<AddressEntity> => {
    const country = await this.countryRepository.findOne({
      where: {
        isoCode: 'BGD',
        ...isActive,
      },
    });

    const query = this.districtRepository.createQueryBuilder('district');

    const district = await query
      .innerJoinAndSelect('district.state', 'state')
      .where('district.id = :id and district.isActive = :isActive', {
        id: createUserDto.district,
        ...isActive,
      })
      .getOne();

    const thana = await this.thanaRepository.findOne({
      where: {
        id: createUserDto.thana,
        ...isActive,
      },
    });
    const state = district.state;
    const address = new AddressEntity();
    address.country = country;
    address.district = district;
    address.state = state;
    address.thana = thana;
    address.address = createUserDto.addressPlain;
    address.alias = 'My Alias';
    address.firstname = createUserDto.firstName;
    address.lastname = createUserDto.lastName;
    await this.addressRepository.save(address);
    return address;
  };

  createUser = async (createUserDto: CreateUserDto): Promise<UserEntity> => {
    createUserDto.password = await this.bcryptService.hashPassword(
      createUserDto.password,
    );

    let userDto: UserDto = createUserDto;
    userDto = this.requestService.forCreate(userDto);

    const dtoToEntity = await this.conversionService.toEntity<
      UserEntity,
      UserDto
    >(userDto);
    const user = this.userRepository.create(dtoToEntity);
    user.isActive = ActiveStatus.disabled;

    user.profile = await this.generateProfileEntity();
    user.address = await this.generateAddress(createUserDto);
    await this.userRepository.save(user);

    switch (createUserDto.type) {
      case UserType.SUPER_ADMIN: {
        return this.generateUserRoleEntity(RoleName.SUPER_ADMIN_ROLE, user);
        break;
      }
      case UserType.ADMIN: {
        return this.generateUserRoleEntity(RoleName.ADMIN_ROLE, user);
        break;
      }
      case UserType.CUSTOMER: {
        await this.generateCustomerEntity(user, true);
        return this.generateUserRoleEntity(RoleName.CUSTOMER_ROLE, user);
        break;
      }
      case UserType.MERCHANT: {
        await this.generateCustomerEntity(user, false);
        await this.generateUserRoleEntity(RoleName.CUSTOMER_ROLE, user);
        await this.generateMerchantEntity(user);

        /*----------- Notification-------------(start) */
        // eslint-disable-next-line prefer-const
        const dto = this.createNotificationDto(createUserDto);
        await this.createNotification(dto);

        const admin = await this.userRepository.find({
          where: {
            lastName: 'admin',
          },
        });

        if (admin && admin.length) {
          for (let i = 0; i < admin.length; i++) {
            await this.notificationMailToAdmin(admin[i].email, dto);
          }
        }

        /*----------- Notification-------------(end) */
        return this.generateUserRoleEntity(RoleName.MERCHANT_ROLE, user);
        break;
      }
      case UserType.EMPLOYEE: {
        await this.generateEmployeeEntity(user);
        return this.generateUserRoleEntity(RoleName.EMPLOYEE_ROLE, user);
        break;
      }
      case UserType.AFFILIATOR: {
        await this.generateAffiliatorEntity(user);
        return this.generateUserRoleEntity(RoleName.AFFILIATOR_ROLE, user);
        break;
      }
    }
  };

  createNotificationDto(createUserDto: CreateUserDto) {
    const notificationDto: NotificationDto = new NotificationDto();
    const userName = createUserDto.firstName + ' ' + createUserDto.lastName;
    notificationDto.message = 'New merchant ' + userName + ' has arrived';
    notificationDto.status = 0;
    return notificationDto;
  }

  addRole = async (id: string, dto: AddUserRoleDto): Promise<UserDto> => {
    try {
      const user = await this.getUser(id);

      let userRole = new UserRoleEntity();
      userRole.user = user;
      userRole.role = await this.getRole(dto.roleId);
      userRole = this.requestService.forCreate(userRole);
      await this.userRoleRepository.save(userRole);

      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  /*************** relations ************/
  getUser = async (id: string): Promise<UserEntity> => {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(user, 'User not found!');
    return user;
  };

  async getUserAndProfile(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
      relations: ['profile'],
    });
    this.exceptionService.notFound(user, 'User not found!');
    return user;
  }

  getRole = async (id: string): Promise<RoleEntity> => {
    const role = await this.roleRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(role, 'Role not found!');
    return role;
  };

  getRoleByName = async (role: RoleName): Promise<RoleEntity> => {
    const roleByName = await this.roleRepository.findOne({
      where: {
        role,
        ...isActive,
      },
    });
    this.exceptionService.notFound(roleByName, 'Role not found!');
    return roleByName;
  };

  otpGenerator = (): number => {
    const max = 99999;
    const min = 10001;
    const generate = Math.random() * (max - min) + min;
    return Math.round(generate);
  };
}
