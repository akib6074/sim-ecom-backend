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
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminGuard,
  CreateShopReviewDto,
  DtoValidationPipe,
  GeneralController,
  HttpCacheInterceptor,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  ShopReviewDto,
  UserGuard,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { ShopReviewService } from './../services/shop-review.service';

@ApiTags('Shop Review')
@ApiBearerAuth()
@Controller('shop-review')
export class ShopReviewController
  implements GeneralController<ShopReviewDto, ResponseDto>
{
  constructor(
    private shopReviewService: ShopReviewService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(HttpCacheInterceptor)
  @Get()
  findAll(): Promise<ResponseDto> {
    const reviewDtos = this.shopReviewService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, reviewDtos);
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
    dto: ShopReviewDto,
  ): Promise<ResponseDto> {
    const shopReviewes = this.shopReviewService.findByObject(dto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      shopReviewes,
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
    const shopReviewes = this.shopReviewService.pagination(
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
      shopReviewes,
    );
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Shop Review is added successfully',
  })
  @ApiBody({ type: ShopReviewDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateShopReviewDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const shopReview = this.shopReviewService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Shop Review added successfully',
      shopReview,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Shop Review is updated successfully',
  })
  @ApiBody({ type: ShopReviewDto })
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
    dto: ShopReviewDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const shopReview = this.shopReviewService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Shop Review is updated successfully',
      shopReview,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Shop Review is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.shopReviewService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Shop Review is deleted successfully',
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
    const shopReviewDto = this.shopReviewService.findById(id, false);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      shopReviewDto,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('shop/:id')
  findByshopId(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const shopReviewDtos = this.shopReviewService.findByShopId(id);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      shopReviewDtos,
    );
  }
}
