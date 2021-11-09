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
  AdminGuard,
  CreateProductAttributeDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  ProductAttributeDto,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
  ShopManagerGuard,
  StockPurchaseEntity,
} from '@simec/ecom-common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductAttributeService } from '../services/product-attribute.service';

@ApiTags('Product Attribute')
@ApiBearerAuth()
@Controller('product-attributes')
export class ProductAttributeController
  implements GeneralController<ProductAttributeDto, ResponseDto>
{
  constructor(
    private productAttributeService: ProductAttributeService,
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
    const productAttributes = this.productAttributeService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      productAttributes,
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
    dto: ProductAttributeDto,
  ): Promise<ResponseDto> {
    const productAttributes = this.productAttributeService.findByObject(dto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      productAttributes,
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
    const productAttributes = this.productAttributeService.pagination(
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
      productAttributes,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/product/:id')
  findByProduct(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const productAttributes = this.productAttributeService.findByProduct(id);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      productAttributes,
    );
  }

  @UseGuards(new ShopManagerGuard())
  @ApiCreatedResponse({
    description: 'Product Attribute is added successfully',
  })
  @ApiBody({ type: CreateProductAttributeDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateProductAttributeDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const productAttribute = this.productAttributeService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Product Attribute is added successfully',
      productAttribute,
    );
  }

  @UseGuards(new ShopManagerGuard())
  @ApiCreatedResponse({
    description: 'Product Attributes are added successfully',
  })
  @ApiBody({ type: CreateProductAttributeDto, isArray: true })
  @Post('create/bulk')
  bulkCreate(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dtos: CreateProductAttributeDto[],
  ): Promise<ResponseDto> {
    const modifiedDtos: CreateProductAttributeDto[] = [];

    for (const dto of dtos) {
      modifiedDtos.push(this.requestService.forCreate(dto));
    }
    const productAttributes =
      this.productAttributeService.bulkCreate(modifiedDtos);

    return this.responseService.toDtosResponse(
      HttpStatus.CREATED,
      'Product Attributes are added successfully',
      productAttributes,
    );
  }


  @UseGuards(new ShopManagerGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product Attribute is updated successfully',
  })
  @ApiBody({ type: CreateProductAttributeDto })
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
    dto: CreateProductAttributeDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const productAttribute = this.productAttributeService.update(
      id,
      modifiedDto,
    );
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Product Attribute is updated successfully',
      productAttribute,
    );
  }

  @UseGuards(new ShopManagerGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product Attribute is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.productAttributeService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Product Attribute is deleted successfully',
      deleted,
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
    const productAttribute = this.productAttributeService.findById(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      productAttribute,
    );
  }
}
