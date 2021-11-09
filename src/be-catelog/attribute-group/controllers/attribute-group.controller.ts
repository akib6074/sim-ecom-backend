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
  AdminGuard,
  AttributeGroupDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';

import { AttributeGroupService } from '../services/attribute-group.service';

@ApiTags('Attribute Groups')
@ApiBearerAuth()
@Controller('attribute-groups')
export class AttributeGroupController
  implements GeneralController<AttributeGroupDto, ResponseDto>
{
  constructor(
    private attributeGroupService: AttributeGroupService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<ResponseDto> {
    const attributeGroups = this.attributeGroupService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      attributeGroups,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('find')
  findOne(
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: AttributeGroupDto,
  ): Promise<ResponseDto> {
    const attributeGroup = this.attributeGroupService.findByObject(dto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      attributeGroup,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('pagination')
  pagination(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
  ): Promise<ResponseDto> {
    const attributeGroups = this.attributeGroupService.pagination(
      page,
      limit,
      sort,
      order,
    );
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      attributeGroups,
    );
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
    const attributeGroup = this.attributeGroupService.findById(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      attributeGroup,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute group is Added successfully',
  })
  @ApiBody({ type: AttributeGroupDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: AttributeGroupDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const attributeGroup = this.attributeGroupService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Attribute group is added successfully',
      attributeGroup,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Attribute group is updated successfully',
  })
  @ApiBody({ type: AttributeGroupDto })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: AttributeGroupDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const attributeGroup = this.attributeGroupService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Attribute group is updated successfully',
      attributeGroup,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Attribute group is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.attributeGroupService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Attribute Group is deleted successfully',
      deleted,
    );
  }
}
