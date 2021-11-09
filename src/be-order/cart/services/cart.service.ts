import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CartDetailsEntity,
  CartDto,
  CartEntity,
  ConversionService,
  CouponEntity,
  CouponUsageEntity,
  CreateCartDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  OrderEntity,
  PermissionService,
  ProductAttributeEntity,
  ProductEntity,
  RequestService,
  SystemException,
  UserDto,
  UserEntity,
  CouponDto,
  CountryEntity,
  CouponUsageDto,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class CartService implements GeneralService<CartDto> {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartDetailsEntity)
    private readonly cartDetailRepository: Repository<CartDetailsEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductAttributeEntity)
    private readonly productAttributeRepository: Repository<ProductAttributeEntity>,
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
    @InjectRepository(CouponUsageEntity)
    private readonly couponUsageRepository: Repository<CouponUsageEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly requestService: RequestService,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(): Promise<CartDto[]> {
    try {
      const carts = await this.cartRepository.find({ ...isActive });
      return this.conversionService.toDtos<CartEntity, CartDto>(carts);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(cartDto: CartDto): Promise<CartDto[]> {
    try {
      const carts = await this.cartRepository.find({
        where: {
          ...cartDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<CartEntity, CartDto>(carts);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[CartDto[], number]> {
    try {
      const carts = await this.cartRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<CartEntity, CartDto>(carts);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByOrder(id: string): Promise<CartDto[]> {
    try {
      const order = await this.getOrder(id);
      const carts = await this.cartRepository.find({
        where: {
          order,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<CartEntity, CartDto>(carts);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByProduct(id: string): Promise<CartDto[]> {
    try {
      const product = await this.getProduct(id);
      const carts = await this.cartRepository.find({
        where: {
          product,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<CartEntity, CartDto>(carts);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findCustomerCart(): Promise<CartDto> {
    try {
      const cart = await this.getCustomerLastCart();
      return this.conversionService.toDto<CartEntity, CartDto>(cart);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateCartDto): Promise<CartDto> {
    try {
      const latestCart = await this.getCustomerLastCart();
      const cart = await this.generateCart(latestCart, dto);
      return this.conversionService.toDto<CartEntity, CartDto>(cart);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async generateCart(
    latestCart: CartEntity,
    dto: CreateCartDto,
  ): Promise<CartEntity> {
    try {
      let newCart = null;
      const cartDetails: CartDetailsEntity[] = [];
      for (const cartDetailDto of dto.cartDetails) {
        const cartDetailEntity =
          this.requestService.forCreateEntity<CartDetailsEntity>(
            new CartDetailsEntity(),
          );
        cartDetailEntity.product = await this.getProduct(
          cartDetailDto.productID,
        );
        if (cartDetailDto.productAttributeID) {
          cartDetailEntity.productAttribute = await this.getProductAttribute(
            cartDetailDto.productAttributeID,
          );
        }
        cartDetailEntity.quantity = cartDetailDto.quantity;
        const cartDetail = await this.cartDetailRepository.create(
          cartDetailEntity,
        );
        await this.cartDetailRepository.save(cartDetail);
        cartDetails.push(cartDetail);
      }
      if (latestCart) {
        newCart = latestCart;
        await this.cartDetailRepository.remove(latestCart.cartDetails);
      } else {
        newCart = this.requestService.forCreateEntity<CartEntity>(
          new CartEntity(),
        );
      }
      newCart.cartDetails = cartDetails;
      newCart.user = await this.getUser(dto.userID);
      await this.cartRepository.save(newCart);
      return newCart;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateCartDto): Promise<CartDto> {
    try {
      const saveDto = await this.getCart(id);
      console.log({ ...saveDto, ...dto });

      const dtoToEntity = await this.conversionService.toEntity<
        CartEntity,
        CartDto
      >({ ...saveDto, ...dto });

      const updatedCart = await this.cartRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<CartEntity, CartDto>(updatedCart);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getCart(id);
      const deleted = await this.cartRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<CartDto> {
    try {
      const cart = await this.getCart(id);
      return this.conversionService.toDto<CartEntity, CartDto>(cart);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/
  async getCart(id: string): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: {
        id,
        ...isActive,
      },
      relations: [
        'order',
        'user',
        'cartDetails',
        'cartDetails.product',
        'cartDetails.productAttribute',
        'coupon',
      ],
    });
    this.exceptionService.notFound(cart, 'Cart Not Found!!');
    return cart;
  }

  async getCustomerLastCart(): Promise<CartEntity> {
    const query = this.cartRepository.createQueryBuilder('cart');
    const cart = await query
      .innerJoinAndSelect('cart.user', 'user')
      .leftJoinAndSelect('cart.cartDetails', 'cartDetails')
      .leftJoinAndSelect('cartDetails.product', 'product')
      .leftJoinAndSelect('cartDetails.productAttribute', 'productAttribute')
      .leftJoinAndSelect('cart.order', 'order')
      .where('user.id=:id', {
        id: this.permissionService.returnRequest().userId,
      })
      .andWhere('order.id IS NULL')
      .getOne();
    return cart;
  }

  async getOrder(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(order, 'Order Not Found!!');
    return order;
  }

  async getProduct(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(product, 'Product Not Found!!');
    return product;
  }

  async getProductAttribute(id: string): Promise<ProductAttributeEntity> {
    const productAttribute = await this.productAttributeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(
      productAttribute,
      'Product Attribute is Not Found!!',
    );
    return productAttribute;
  }

  async getUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(user, 'User Not Found!!');
    return user;
  }

  /*********************** End checking relations of post *********************/

  async findByCouponCode(
    code: string,
    withRelation = true,
  ): Promise<CouponDto> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { couponCode: code, ...isActive },
        relations: withRelation
          ? [
              'users',
              'shops',
              'categories',
              'products',
              'thanas',
              'freeProduct',
              'freeProductAttribute',
            ]
          : [],
      });
      return this.conversionService.toDto<CouponEntity, CouponDto>(coupon);
    } catch (error) {
      throw new SystemException(error);
    }
  }
  async findByCouponId(
    couponID: string,
    withRelation = true,
  ): Promise<CouponEntity> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { id: couponID, ...isActive },
        relations: withRelation
          ? [
              'users',
              'shops',
              'categories',
              'products',
              'thanas',
              'freeProduct',
              'freeProductAttribute',
            ]
          : [],
      });
      // return await this.conversionService.toDto<CouponEntity, CouponDto>(
      //   coupon,
      // );
      return coupon;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async checkCoupon(cartId: string, couponCode: string): Promise<CouponDto> {
    const coupon = await this.findByCouponCode(couponCode);
    if (coupon === undefined) {
      return null;
    }
    const cartE = await this.getCart(cartId);
    const cart = await this.conversionService.toDto<CartEntity, CartDto>(cartE);
    const couponUserQ = await this.couponUsageRepository
      .createQueryBuilder()
      .select(['1'])
      .where('"user_id" = :userID and "coupon_id" = :couponID', {
        userID: cart.user.id,
        couponID: coupon.id,
      });
    const couponUsageByUser = await couponUserQ.getCount();
    // console.log(couponUserQ.getQueryAndParameters());
    if (couponUsageByUser > coupon.quantityPerUser) {
      return null;
    }
    let canCouponApply = false;
    // console.log(coupon);
    if (
      coupon.users.length === 0 &&
      coupon.products.length === 0 &&
      coupon.categories.length === 0 &&
      coupon.shops.length === 0 &&
      coupon.thanas.length === 0
    ) {
      canCouponApply = true;
    } else {
      if (
        coupon.users.findIndex((user) => {
          return user.id === cart.id;
        }) > -1
      ) {
        canCouponApply = true;
      }
      for (let i = 0; i < cart.cartDetails.length; i++) {
        if (
          coupon.products.findIndex((product) => {
            return cart.cartDetails[i].id === product.id;
          }) > -1
        ) {
          canCouponApply = true;
          break;
        }
        if (
          coupon.categories.findIndex((category) => {
            return cart.cartDetails[i].product.category.id === category.id;
          }) > -1
        ) {
          canCouponApply = true;
          break;
        }
        if (
          coupon.shops.findIndex((shop) => {
            return cart.cartDetails[i].product.shop.id === shop.id;
          }) > -1
        ) {
          canCouponApply = true;
          break;
        }
        if (
          coupon.thanas.findIndex((thana) => {
            return cart.cartDetails[i].product.shop.location === thana.name;
          }) > -1
        ) {
          canCouponApply = true;
          break;
        }
      }
    }

    // console.log({ canCouponApply });

    if (canCouponApply === true) {
      return coupon;
    }
    return null;
  }

  async couponUsage(userId: string, couponId: string): Promise<CouponUsageDto> {
    const userE = await this.userRepository.findOne({ id: userId });
    const couponE = await this.findByCouponId(couponId);
    const couponUsage = this.requestService.forCreateEntity<CouponUsageEntity>(
      new CouponUsageEntity(),
    );
    couponUsage.coupon = couponE;
    couponUsage.user = userE;
    const couponUsageE = await couponUsage.save();
    return this.conversionService.toDto<CouponUsageEntity, CouponUsageDto>(
      couponUsageE,
    );
  }
  /*********************** End checking of coupon *********************/
}
