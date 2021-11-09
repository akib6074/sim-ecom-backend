import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordDto,
  DtoValidationPipe,
  LoginDto,
  PhoneOrEmailDto,
  ResponseDto,
  ResponseService,
  UserDto,
  UserResponseDto,
  ResetPasswordDto,
} from '@simec/ecom-common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Login is successful',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    loginDto: LoginDto,
  ) {
    const payload = this.authService.login(loginDto);
    return this.responseService.toResponse<UserResponseDto>(
      HttpStatus.OK,
      'Login is successful',
      payload,
    );
  }

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Email is sent with password changed url',
  })
  @HttpCode(HttpStatus.OK)
  @Post('forget-password')
  async forgetPassword(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    phoneOrEmailDto: PhoneOrEmailDto,
  ): Promise<ResponseDto> {
    const payload = this.authService.forgetPassword(phoneOrEmailDto);
    return this.responseService.toResponse<UserDto>(
      HttpStatus.OK,
      'Email is sent with password changed url',
      payload,
    );
  }

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Password is changed successfully!! You can login now!',
  })
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    changePasswordDto: ChangePasswordDto,
  ): Promise<ResponseDto> {
    const payload = this.authService.changePassword(changePasswordDto);
    return this.responseService.toResponse<UserDto>(
      HttpStatus.OK,
      'Password is changed successfully!! You can login now!',
      payload,
    );
  }

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Password is re-set successfully!! You can login now!',
  })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseDto> {
    const payload = this.authService.resetPassword(resetPasswordDto);
    return this.responseService.toResponse<UserDto>(
      HttpStatus.OK,
      'Password is re-set successfully!! You can login now!',
      payload,
    );
  }
}
