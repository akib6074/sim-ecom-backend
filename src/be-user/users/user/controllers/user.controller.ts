import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AddUserRoleDto,
  AdminGuard,
  CreateUserDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  OtpDto,
  ResponseDto,
  ResponseService,
  ShopManagerGuard,
  SuperAdminGuard,
  UserDto,
  UuidValidationPipe,
  UserGuard,
} from '@simec/ecom-common';

import { UserService } from '../services/user.service';

@ApiTags('User')
@Controller('users')
export class UserController implements GeneralController<UserDto> {
  constructor(
    private readonly userService: UserService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('pagination')
  pagination(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
  ): Promise<ResponseDto> {
    const user = this.userService.pagination(page, limit);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      user,
    );
  }

  @ApiBearerAuth()
  @UseGuards(new SuperAdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<ResponseDto> {
    const userDto = this.userService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, userDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('wishlist')
  getWishListByUserId(): Promise<ResponseDto> {
    const userDto = this.userService.getWishListByUserId();
    return this.responseService.toDtoResponse(HttpStatus.OK, null, userDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('following-shops')
  getFollowingShopByUserId(): Promise<ResponseDto> {
    const userDto = this.userService.getFollowingShopsByUserId();
    return this.responseService.toDtoResponse(HttpStatus.OK, null, userDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const userDto = this.userService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, userDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('inactive/:id')
  findInactiveUserById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const userDto = this.userService.findInactiveUserById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, userDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id/profile')
  findProfileById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const userDto = this.userService.getProfileByUserId(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, userDto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('find')
  findOne(
    @Body(new DtoValidationPipe({ skipMissingProperties: true })) dto: UserDto,
  ): Promise<ResponseDto> {
    const users = this.userService.findOne(dto);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, users);
  }

  @ApiBearerAuth()
  @UseGuards(new ShopManagerGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/merchants')
  findAllMerchant(): Promise<ResponseDto> {
    const users = this.userService.findAllMerchant();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, users);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Verify Your OTP First',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('registration')
  create(
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    createUserDto: CreateUserDto,
  ): Promise<ResponseDto> {
    const userDto = this.userService.create(createUserDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Verify Your OTP First',
      userDto,
    );
  }

  @ApiBody({ type: OtpDto })
  @ApiOkResponse({
    status: HttpStatus.CREATED,
    description: 'Otp verified Successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('verify-otp/:id')
  verifyOtp(
    @Param('id') id: string,
    @Body() otp: OtpDto,
  ): Promise<ResponseDto> {
    const userOtp = this.userService.verifyOtp(id, otp);
    return this.responseService.toResponse(
      HttpStatus.CREATED,
      'Otp verified Successfully',
      userOtp,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Otp resend. Please check your mobile or mail',
  })
  @HttpCode(HttpStatus.OK)
  @Post('resend-otp/:id')
  resendOtp(@Param('id') id: string): Promise<ResponseDto> {
    const userOtp = this.userService.resendOtp(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Otp resend. Please check your mobile or mail',
      userOtp,
    );
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'User created Successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/add-role')
  addRole(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(
      new DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    addUserRoleDto: AddUserRoleDto,
  ): Promise<ResponseDto> {
    const userDto = this.userService.addRole(id, addUserRoleDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'User created Successfully',
      userDto,
    );
  }

  @UseGuards(new UserGuard())
  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(new DtoValidationPipe({ skipMissingProperties: true }))
    dto: CreateUserDto,
  ): Promise<ResponseDto> {
    const userDto = this.userService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'User updated successfully',
      userDto,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiBearerAuth()
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.userService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'User deleted successfully',
      deleted,
    );
  }
}
