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
  BaseDto,
  CartDto,
  CartEntity,
  CouponCheckDto,
  CreateCartDto,
  CustomerGuard,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from '../services/cart.service';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('carts')
export class CartController implements GeneralController<CartDto> {
  constructor(
    private cartService: CartService,
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
    const carts = this.cartService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, carts);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('customer-cart')
  findCustomerCart(): Promise<ResponseDto> {
    const cart = this.cartService.findCustomerCart();
    return this.responseService.toDtoResponse(HttpStatus.OK, null, cart);
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
    cartDto: CartDto,
  ): Promise<ResponseDto> {
    const carts = this.cartService.findByObject(cartDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, carts);
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
    const carts = this.cartService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      carts,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/order/:id')
  findByOrder(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const carts = this.cartService.findByOrder(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, carts);
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
    const carts = this.cartService.findByProduct(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, carts);
  }

  @UseGuards(new CustomerGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Cart is added successfully',
  })
  @ApiBody({ type: CreateCartDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    cartDto: CreateCartDto,
  ): Promise<ResponseDto> {
    const couponCode = cartDto.couponCode;
    delete cartDto.couponCode;
    const modifiedDto = this.requestService.forCreate(cartDto);
    const cart = await this.cartService.create(modifiedDto);
    const cartInfo = await Promise.resolve<CartDto>(cart);
    const couponInfo = await this.cartService.checkCoupon(
      cartInfo.id,
      couponCode,
    );
    // console.log(cartDto, cartInfo, couponInfo);
    if (couponInfo !== null) {
      cartInfo.coupon = couponInfo;
      const createCartDto = new CreateCartDto();
      createCartDto.coupon = couponInfo;
      const upcart =
        this.requestService.forUpdate<CreateCartDto>(createCartDto);
      const cartWithCoupon = await this.cartService.update(cartInfo.id, upcart);
      const couponUsage = await this.cartService.couponUsage(
        cartInfo.user.id,
        couponInfo.id,
      );
      // console.log(couponUsage);
      return this.responseService.toDtoResponse(
        HttpStatus.CREATED,
        'Cart is added successfully',
        cartWithCoupon as any,
      );
    }
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Cart is added successfully',
      cart as any,
    );
  }

  @UseGuards(new CustomerGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Cart is updated successfully',
  })
  @ApiBody({ type: CreateCartDto })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    cartDto: CreateCartDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(cartDto);
    const cart = this.cartService.update(id, modifiedDto);
    const cartInfo = await Promise.resolve<CartDto>(cart);
    console.log(cartDto, cartInfo);

    // const couponInfo = this.cartService.checkCoupon(
    //   cartInfo.id,
    //   cartInfo.coupon.couponCode,
    // );
    // console.log(couponInfo);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Cart is updated successfully',
      cart,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Cart is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.cartService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Cart is deleted successfully',
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
    const carts = this.cartService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, carts);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @ApiBody({ type: CouponCheckDto })
  @HttpCode(HttpStatus.OK)
  @Post('check-coupon')
  checkCouponCode(
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    cartCouponDto: CouponCheckDto,
  ): Promise<ResponseDto> {
    const carts = this.cartService.checkCoupon(
      cartCouponDto.cartId,
      cartCouponDto.coupnCode,
    );
    return this.responseService.toDtoResponse(HttpStatus.OK, null, carts);
  }
}
