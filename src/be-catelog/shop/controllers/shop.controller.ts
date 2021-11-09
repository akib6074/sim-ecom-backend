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
import { MessagePattern } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminGuard,
  CreateShopDto,
  DtoValidationPipe,
  FollowShopDto,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  ShopDto,
  ShopManagerGuard,
  UserGuard,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { ShopService } from '../services/shop.service';

@ApiTags('Shop')
@ApiBearerAuth()
@Controller('shops')
export class ShopController implements GeneralController<ShopDto> {
  constructor(
    private shopService: ShopService,
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
    const shops = this.shopService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, shops);
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
    dto: ShopDto,
  ): Promise<ResponseDto> {
    const shops = this.shopService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, shops);
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
    const shops = this.shopService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      shops,
    );
  }

  /*********************** for frontend start ***********************/
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/type')
  async findByTypePagination(
    @Query('id', new UuidValidationPipe()) id: string,
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('rating') rating: string,
    @Query('algorithm') algorithm: string,
  ): Promise<ResponseDto> {
    const shops = await this.shopService.findByTypePagination(
      id,
      page,
      limit,
      rating,
      algorithm,
    );
    const promotions = await this.shopService.findLatestPromotionsByType(id);
    const payload = {
      count: shops[0]?.length,
      data: { promotions, shops: shops[0] },
    };
    return new ResponseDto(
      new Date().getTime(),
      HttpStatus.OK,
      'Shops and Promotions are loaded successfully',
      null,
      payload,
      null,
    );
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Shop is added in user following list successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('follow')
  followShop(
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: FollowShopDto,
  ): Promise<ResponseDto> {
    const user = this.shopService.followShop(dto.shopId, dto.userId);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, user);
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Shop is deleted in user following list successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Delete(':id/unfollow')
  unFollowShop(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const user = this.shopService.unFollowShop(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, user);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/:name')
  findByName(@Param('name') name: string): Promise<ResponseDto> {
    const shop = this.shopService.findByName(name);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, shop);
  }

  /*********************** for frontend end ***********************/
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/user/:id')
  findByMerchant(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const shops = this.shopService.findByMerchant(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, shops);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Number of shops a merchant has created',
  })
  @HttpCode(HttpStatus.OK)
  @Get('shop-count/:id')
  shopCountByMerchant(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<any> {
    const shopCount = this.shopService.shopCountByMerchant(id);
    return this.responseService.toResponse(HttpStatus.OK, null, shopCount);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/user/:id/type')
  findShopAndTypeByMerchant(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const shops = this.shopService.findByMerchant(id, true);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, shops);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('popular')
  findPopularShops(): Promise<ResponseDto> {
    const shops = this.shopService.findPopularShops();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, shops);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('trending')
  findTrendingShops(): Promise<ResponseDto> {
    const shops = this.shopService.findTrendingShops();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, shops);
  }

  @UseGuards(new ShopManagerGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Shop is added successfully',
  })
  @ApiBody({ type: CreateShopDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreateShopDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const shop = this.shopService.create(modifiedDto);

    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Shop is added successfully',
      shop,
    );
  }

  @UseGuards(new ShopManagerGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Shop is updated successfully',
  })
  @ApiBody({ type: CreateShopDto })
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
    dto: CreateShopDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const shop = this.shopService.update(id, modifiedDto);

    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Shop is updated successfully',
      shop,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Shop is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.shopService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Shop is deleted successfully',
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
    const shop = this.shopService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, shop);
  }

  @MessagePattern({ service: 'shops', cmd: 'get', method: 'getByID' })
  getByID(id: string): Promise<ShopDto> {
    return this.shopService.findById(id);
  }
}
