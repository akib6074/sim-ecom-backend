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
  CreateProductDto,
  CreateWishListDto,
  DtoValidationPipe,
  GeneralController,
  HttpCacheInterceptor,
  IntValidationPipe,
  ProductDto,
  RequestService,
  ResponseDto,
  ResponseService,
  ShopManagerGuard,
  UserGuard,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { ProductService } from '../services/product.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('products')
export class ProductController
  implements GeneralController<ProductDto, ResponseDto>
{
  constructor(
    private productService: ProductService,
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
    const products = this.productService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, products);
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
    dto: ProductDto,
  ): Promise<ResponseDto> {
    const products = this.productService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, products);
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
    const products = this.productService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      products,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('stock')
  stock(
      @Query('page', new IntValidationPipe()) page: number,
      @Query('limit', new IntValidationPipe()) limit: number,
  ): Promise<ResponseDto> {
    const products = this.productService.stock(page, limit);
    return this.responseService.toPaginationResponse(
        HttpStatus.OK,
        null,
        page,
        limit,
        products,
    );
  }

  /*********************** for frontend start ***********************/
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/category')
  async findByCategoryPagination(
    @Query('id', new UuidValidationPipe()) id: string,
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('price') price: string,
    @Query('rating') rating: string,
    @Query('algorithm') algorithm: string,
  ): Promise<ResponseDto> {
    const products = await this.productService.findByCategoryPagination(
      id,
      page,
      limit,
      price,
      rating,
      algorithm,
    );

    const promotions = await this.productService.findLatestPromotionsByCategory(
      id,
    );

    const payload = {
      count: products[0]?.length,
      data: { promotions, products: products[0] },
    };
    return new ResponseDto(
      new Date().getTime(),
      HttpStatus.OK,
      'Products and Promotions are loaded successfully',
      null,
      payload,
      null,
    );
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Product is added in user wishlist successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('wishlist')
  productWishList(
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateWishListDto,
  ): Promise<ResponseDto> {
    const user = this.productService.productWishlist(dto.productId, dto.userId);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, user);
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Product is deleted from user wishlist successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Delete(':id/removewishlist')
  removeWishlist(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const user = this.productService.removewishlist(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, user);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/shop')
  findByShop(
    @Query('id', new UuidValidationPipe()) id: string,
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
  ): Promise<ResponseDto> {
    const products = this.productService.findByShopPagination(id, page, limit);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      products,
    );
  }
  /*********************** for frontend end ***********************/
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/user/:id')
  findByUser(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const products = this.productService.findByUser(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, products);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('popular')
  findPopularProducts(): Promise<ResponseDto> {
    const products = this.productService.findPopularProducts();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, products);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('trending')
  findTrendingProducts(): Promise<ResponseDto> {
    const products = this.productService.findTrendingProducts();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, products);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/user/:id/category')
  findProductsAndCategoryByUser(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const products = this.productService.findByUser(id, true);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, products);
  }

  @UseGuards(new ShopManagerGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Product is added successfully',
  })
  @ApiBody({ type: CreateProductDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateProductDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const product = this.productService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Product is added successfully',
      product,
    );
  }

  @UseGuards(new ShopManagerGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product is updated successfully',
  })
  @ApiBody({ type: CreateProductDto })
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
    dto: CreateProductDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const product = this.productService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Product is updated successfully',
      product,
    );
  }

  @UseGuards(new ShopManagerGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Product is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.productService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Product is deleted successfully',
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
    const product = this.productService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, product);
  }
}
