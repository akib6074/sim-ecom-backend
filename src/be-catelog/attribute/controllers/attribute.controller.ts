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
  AttributeDto,
  CreateAttributeDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';

import { AttributeService } from '../services/attribute.service';

@ApiTags('Attribute')
@ApiBearerAuth()
@Controller('attributes')
export class AttributeController
  implements GeneralController<AttributeDto, ResponseDto>
{
  constructor(
    private attributeService: AttributeService,
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
    const attributes = this.attributeService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, attributes);
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
    dto: AttributeDto,
  ): Promise<ResponseDto> {
    const attributes = this.attributeService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, attributes);
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
    const attributes = this.attributeService.pagination(
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
      attributes,
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
    const attribute = this.attributeService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, attribute);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/attribute-groups/:id')
  findByAttributeGroup(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const attributeGroup = this.attributeService.findByAttributeGroup(id);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      attributeGroup,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Attribute is added successfully',
  })
  @ApiBody({ type: CreateAttributeDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateAttributeDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const attribute = this.attributeService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Attribute  is added successfully',
      attribute,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Attribute  is updated successfully',
  })
  @ApiBody({ type: CreateAttributeDto })
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
    dto: CreateAttributeDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const attribute = this.attributeService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Attribute group is updated successfully',
      attribute,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Attribute is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.attributeService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Attribute is deleted successfully',
      deleted,
    );
  }
}
