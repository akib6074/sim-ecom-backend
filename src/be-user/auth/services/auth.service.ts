import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { RedisService } from 'nestjs-redis';
import { UserService } from '../../users/user/services/user.service';
import {
  BcryptService,
  ChangePasswordDto,
  CustomUserRoleDto,
  LoginDto,
  MailParserDto,
  PhoneOrEmailDto,
  Redis,
  RoleName,
  SystemException,
  UserDto,
  UserResponseDto,
  UserRoleDto,
  ResetPasswordDto,
  MailFromDto,
} from '@simec/ecom-common';
import { timeout } from 'rxjs/operators';
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly notificationClient: ClientProxy;

  constructor(
    private readonly configService: ConfigService,
    private readonly bcryptService: BcryptService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    this.notificationClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { url: configService.get('NOTIFICATION_SERVICE_URL')},
    });
  }

  async login(loginDto: LoginDto): Promise<UserResponseDto> {
    try {
      const user = await this.validateUser(loginDto);
      const userRoles = await this.userService.findRolesByUserId(user.id);
      const userResponseDto = await this.generatePayload(user, userRoles);
      const accessToken = await this.generateToken(userResponseDto, loginDto);

      await this.redisService
        .getClient(Redis.REDIS_SESSION)
        .set(accessToken, JSON.stringify(userResponseDto));
      userResponseDto.accessToken = accessToken;

      return Promise.resolve(userResponseDto);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async forgetPassword(phoneOrEmailDto: PhoneOrEmailDto): Promise<UserDto> {
    try {
      const user = await this.userService.updatePasswordToken(phoneOrEmailDto);
      if (user) {
        const mailParserDto = this.getForgetPasswordContent(user);
        this.notificationClient
            .emit({ service: 'mail', cmd: 'post', method: 'sendNoReplyMailMessage' }, mailParserDto)
            .pipe(timeout(5000))
            .subscribe();
        delete user.password;
        return Promise.resolve(user);
      } else {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User phone or email is not correct',
        });
      }
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<UserDto> {
    try {
      const user = await this.userService.updatePassword(changePasswordDto);
      if (user) {
        delete user.password;
        return Promise.resolve(user);
      } else {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User phone or email is not correct',
        });
      }
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<UserDto> {
    try {
      const user = await this.userService.resetPassword(resetPasswordDto);
      if (user) {
        delete user.password;
        return Promise.resolve(user);
      } else {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User phone or email is not correct',
        });
      }
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async generateToken(
    payload: UserResponseDto,
    loginDto: LoginDto,
  ): Promise<string> {
    const privateKEY = this.configService
      .get('PRIVATE_KEY')
      .replace(/\\n/g, '\n');

    let accessToken;

    if (loginDto.isChecked === 1) {
      accessToken = jwt.sign({ ...payload }, privateKEY, {
        expiresIn: '365d',
        algorithm: 'RS256',
      });
    } else {
      accessToken = jwt.sign({ ...payload }, privateKEY, {
        expiresIn: '1h',
        algorithm: 'RS256',
      });
    }
    this.logger.log('access token: ' + accessToken);
    return Promise.resolve(accessToken);
  }

  async generatePayload(
    userDto: UserDto,
    userRoles: UserRoleDto[],
  ): Promise<UserResponseDto> {
    let isSuperAdmin = false;
    let isAdmin = false;
    let isEmployee = false;
    let isCustomer = false;
    let isMerchant = false;
    let isUser = false;
    let isAffiliator = false;

    const customUserRoleDtos = [];
    for (const userRole of userRoles) {
      const customUserRoleDto = new CustomUserRoleDto();
      customUserRoleDto.role = userRole.role?.role as RoleName;
      switch (userRole.role?.role as RoleName) {
        case RoleName.SUPER_ADMIN_ROLE:
          isSuperAdmin = true;
          break;
        case RoleName.ADMIN_ROLE:
          isAdmin = true;
          break;
        case RoleName.EMPLOYEE_ROLE:
          isEmployee = true;
          break;
        case RoleName.CUSTOMER_ROLE:
          isCustomer = true;
          break;
        case RoleName.MERCHANT_ROLE:
          isMerchant = true;
          break;
        case RoleName.USER_ROLE:
          isUser = true;
          break;
        case RoleName.AFFILIATOR_ROLE:
          isAffiliator = true;
          break;
      }
      customUserRoleDto.shopId = userRole.shop?.id;
      customUserRoleDtos.push(customUserRoleDto);
    }
    const userResponseDto = new UserResponseDto();
    userResponseDto.userId = userDto.id;
    userResponseDto.phone = userDto.phone;
    userResponseDto.userName = userDto.firstName + ' ' + userDto.lastName;
    userResponseDto.roles = customUserRoleDtos;
    userResponseDto.isSuperAdmin = isSuperAdmin;
    userResponseDto.isAdmin = isAdmin;

    userResponseDto.isEmployee = isEmployee;
    userResponseDto.isCustomer = isCustomer;
    userResponseDto.isMerchant = isMerchant;
    userResponseDto.isUser = isUser;
    userResponseDto.isAffiliator = isAffiliator;
    userResponseDto.hasLicenseAndNID = false;
    if (userDto.license && userDto.nid) {
      userResponseDto.hasLicenseAndNID = true;
    }
    return Promise.resolve(userResponseDto);
  }

  async validateUser(loginDto: LoginDto): Promise<UserDto> {
    try {
      const user: UserDto = await this.userService.findOneByEmailOrPhone(
        loginDto.phone || loginDto.email,
      );

      const isPasswordMatched = await this.bcryptService.comparePassword(
        loginDto.password,
        user?.password,
      );

      if (!isPasswordMatched) {
        throw new SystemException({
          status: HttpStatus.BAD_REQUEST,
          message: 'User password is not valid',
        });
      }
      return user;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  getForgetPasswordContent(user: UserDto): MailParserDto {
    const parseMailFrom = new MailFromDto();
    parseMailFrom.address = this.configService.get('MAIL_NO_REPLY_USER');
    parseMailFrom.name = 'EBONEAR';

    const mailParserDto = new MailParserDto();
    mailParserDto.from = parseMailFrom;
    mailParserDto.to = user.email;
    mailParserDto.subject = 'reset password';
    const serverUrl =
      this.configService.get('RESET_PASSWORD_MAIL_LINK') +
      '/' +
      user.resetPasswordToken;
    console.log('pass:' + serverUrl);

    mailParserDto.html =
      '<body bgcolor="#e1e5e8" style="margin-top: 0;margin-bottom: 0;margin-right: 0;margin-left: 0;padding-top: 10px;padding-bottom: 10px;padding-right: 10px;padding-left: 10px;background-color: #e1e5e8;"><div style="padding: 10px; background-color: #ffffff"><div style="margin: center auto; text-align: center"><h1>Forget your password?</h1><div>That\'s okay, it happens! Click on the button below to reset your password.</div><a href="' +
      serverUrl +
      '" style="cursor:pointer;display: inline-block;border-radius: 3px;margin: 20px;padding: 10px;background-color: #f8d155;color: #222;text-decoration: none;">Reset Password</a></div></div></body>';
    return mailParserDto;
  }
}
