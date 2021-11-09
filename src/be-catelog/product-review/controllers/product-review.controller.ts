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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';
import {
  CreateProductReviewDto,
  DtoValidationPipe,
  GeneralController,
  HttpCacheInterceptor,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UserGuard,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { ProductReviewDto } from '@simec/ecom-common/dist/dto/product/product-review.dto';
import { ProductReviewService } from '../services/product-review.service';

@ApiTags('Product_Review')
@ApiBearerAuth()
@Controller('product-review')
export class ProductReviewController
  implements GeneralController<ProductReviewDto, ResponseDto>
{
  constructor(
    private productReviewService: ProductReviewService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'All product reviews are found',
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(HttpCacheInterceptor)
  @Get()
  findAll(): Promise<ResponseDto> {
    const reviewDtos = this.productReviewService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, reviewDtos);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product review found successfully',
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
    dto: ProductReviewDto,
  ): Promise<ResponseDto> {
    const productReviewes = this.productReviewService.findByObject(dto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      productReviewes,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product reviews pagination found successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Get('pagination')
  pagination(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
  ): Promise<ResponseDto> {
    const productReviewes = this.productReviewService.pagination(
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
      productReviewes,
    );
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Product Review is added successfully',
  })
  @ApiBody({ type: ProductReviewDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateProductReviewDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const productReview = this.productReviewService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Product Review is added successfully',
      productReview,
    );
  }

  @UseGuards(new UserGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product review is updated successfully',
  })
  @ApiBody({ type: ProductReviewDto })
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
    dto: ProductReviewDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const prodectReview = this.productReviewService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Product review is updated successfully',
      prodectReview,
    );
  }

  @UseGuards(new UserGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product review is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.productReviewService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Product review is deleted successfully',
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
    const productReviewDto = this.productReviewService.findById(id, false);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      productReviewDto,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('product/:id')
  findByProductId(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const productReviewDtos = this.productReviewService.findByProductId(id);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      productReviewDtos,
    );
  }
}
