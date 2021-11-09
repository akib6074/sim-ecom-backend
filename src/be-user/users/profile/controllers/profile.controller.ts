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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import {
  AdminGuard,
  GeneralController,
  ProfileDto,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profiles')
export class ProfileController implements GeneralController<ProfileDto> {
  constructor(
    private readonly profileService: ProfileService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<ResponseDto> {
    const profileDto = this.profileService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, profileDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseDto> {
    const profileDto = this.profileService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, profileDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('find')
  findOne(@Body() dto: ProfileDto): Promise<ResponseDto> {
    const profiles = this.profileService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, profiles);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Profile created Successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: ProfileDto): Promise<ResponseDto> {
    const profileDto = this.profileService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Profile created Successfully',
      profileDto,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: ProfileDto,
  ): Promise<ResponseDto> {
    const profileDto = this.profileService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Profile updated successfully',
      profileDto,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Profile deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const profileDto = this.profileService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Profile deleted successfully',
      profileDto,
    );
  }
}
