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
import {
  AdminGuard,
  DtoValidationPipe,
  GeneralController,
  ResponseDto,
  ResponseService,
  RoleDto,
  UuidValidationPipe,
} from '@simec/ecom-common';

import { RoleService } from '../services/role.service';

@ApiTags('Role')
@ApiBearerAuth()
@Controller('roles')
export class RoleController implements GeneralController<RoleDto> {
  constructor(
    private roleService: RoleService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<ResponseDto> {
    const roleDto = this.roleService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, roleDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const roleDto = this.roleService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, roleDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('find')
  findOne(@Body() dto: RoleDto): Promise<ResponseDto> {
    const roles = this.roleService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, roles);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Role created Successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: RoleDto): Promise<ResponseDto> {
    const roleDto = this.roleService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Role created Successfully',
      roleDto,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: RoleDto): Promise<ResponseDto> {
    const roleDto = this.roleService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Role updated successfully',
      roleDto,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  createRole(
    @Body(new DtoValidationPipe()) roleDto: RoleDto,
  ): Promise<RoleDto> {
    return this.roleService.create(roleDto);
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Role deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const roleDto = this.roleService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Role deleted successfully',
      roleDto,
    );
  }
}
