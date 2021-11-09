import {
  Body,
  CacheKey,
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
  UseInterceptors,
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
  DtoValidationPipe,
  GeneralController,
  HttpCacheInterceptor,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  ShopTypeDto,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { ShopTypeService } from '../services/shop-type.service';
import { EcomCatelogCacheKeyEnum } from '../../../cache/ecom-cache-key.enum';

@ApiTags('Shop Type')
@ApiBearerAuth()
@Controller('shop-types')
export class TypeController
  implements GeneralController<ShopTypeDto, ResponseDto>
{
  constructor(
    private shopTypeService: ShopTypeService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(EcomCatelogCacheKeyEnum.TYPES_FIND_ALL)
  @Get()
  findAll(): Promise<ResponseDto> {
    const typeDto = this.shopTypeService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, typeDto);
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
    dto: ShopTypeDto,
  ): Promise<ResponseDto> {
    const types = this.shopTypeService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, types);
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
    const types = this.shopTypeService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      types,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Type is added successfully',
  })
  @ApiBody({ type: ShopTypeDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: ShopTypeDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const type = this.shopTypeService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Type added successfully',
      type,
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
    const typeDto = this.shopTypeService.findById(id, false);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, typeDto);
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Type is updated successfully',
  })
  @ApiBody({ type: ShopTypeDto })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: ShopTypeDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const type = this.shopTypeService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Type is updated successfully',
      type,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Type is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.shopTypeService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Type is deleted successfully',
      deleted,
    );
  }
}
