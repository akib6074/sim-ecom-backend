import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CategoryEntity,
  ConversionService,
  CreateProductDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  PermissionService,
  ProductDto,
  ProductEntity,
  PromotionDto,
  PromotionEntity,
  ShopEntity,
  SystemException,
  UserDto,
  UserEntity,
  StockPurchaseEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService implements GeneralService<ProductDto> {
  private readonly logger = new Logger(ProductService.name);
  private readonly searchClient: ClientProxy;

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
    @InjectRepository(StockPurchaseEntity)
    private readonly stockPurchaseRepository: Repository<StockPurchaseEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly permissionService: PermissionService,
    private readonly configService: ConfigService,
  ) {
    this.searchClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: configService.get('SEARCH_SERVICE_URL'),
      },
    });
  }

  async findAll(): Promise<ProductDto[]> {
    try {
      const products = await this.productRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<ProductEntity, ProductDto>(products);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findPopularProducts(): Promise<ProductDto[]> {
    try {
      const products = await this.productRepository.find({
        where: { ...isActive },
        take: 4,
        order: { popular: 'DESC' }
      });
      return this.conversionService.toDtos<ProductEntity, ProductDto>(products);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findTrendingProducts(): Promise<ProductDto[]> {
    try {
      const products = await this.productRepository.find({
        where: { ...isActive },
        take: 4,
        order: { trending: 'DESC' }
      });
      return this.conversionService.toDtos<ProductEntity, ProductDto>(products);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ProductDto[], number]> {
    const user = this.permissionService.returnRequest();
    try {
      const where = { ...isActive };
      if (user && user.isMerchant) {
        where['user'] = await this.userRepository.findOne({
          where: { ...isActive, id: user.userId },
        });
      }
      const products = await this.productRepository.findAndCount({
        where: { ...where },
        take: limit,
        skip: (page - 1) * limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<ProductEntity, ProductDto>(
        products,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async stock(
      page: number,
      limit: number,
  ): Promise<[ProductDto[], number]> {
    try {
      const products = await this.productRepository.findAndCount({
        where: { ...isActive },
        take: limit,
        skip: (page - 1) * limit,
        order: {
          'quantity': 'ASC',
        },
        relations: ['productAttributes']
      });

      return this.conversionService.toPagination<ProductEntity, ProductDto>(
          products,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /*********************** for frontend start ***********************/
  async findByCategoryPagination(
    id: string,
    page: number,
    limit: number,
    price: string,
    rating: string,
    algorithm: string,
  ): Promise<[ProductDto[], number]> {
    try {
      const category = await this.getCategory(id);
      let order: any = {};
      if (price && price === 'asc') {
        order = { ...order, price: 'ASC' };
      }
      if (price && price === 'dsc') {
        order = { ...order, price: 'DESC' };
      }
      if (rating && rating === 'asc') {
        order = { ...order, rating: 'ASC' };
      }
      if (rating && rating === 'dsc') {
        order = { ...order, rating: 'DESC' };
      }
      if (algorithm && algorithm === 'latest') {
        order = { ...order, updatedAt: 'DESC' };
      }
      if (algorithm && algorithm === 'popular') {
        order = { ...order, popular: 'DESC' };
      }
      if (algorithm && algorithm === 'trending') {
        order = { ...order, trending: 'DESC' };
      }
      const products = await this.productRepository.findAndCount({
        where: {
          category,
          ...isActive,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: order,
      });
      return this.conversionService.toPagination<ProductEntity, ProductDto>(
        products,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findLatestPromotionsByCategory(id: string): Promise<PromotionDto[]> {
    const category = await this.getCategory(id);

    const promotions = await this.promotionRepository.find({
      where: {
        category,
        ...isActive,
      },
      relations: ['product'],
      take: 2,
      order: { updatedAt: 'DESC' },
    });
    return this.conversionService.toDtos<PromotionEntity, PromotionDto>(
      promotions,
    );
  }

  productWishlist = async (
    productId: string,
    userId: string,
  ): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, ...isActive },
        relations: ['wishlist'],
      });

      const product = await this.productRepository.findOne({
        id: productId,
        ...isActive,
      });
      if (user.wishlist) {
        console.log('user:yes');
        user.wishlist.push(product);
      } else {
        user.wishlist = [product];
      }
      await this.userRepository.save(user);
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  removewishlist = async (id: string): Promise<UserDto> => {
    try {
      const userId = this.permissionService.returnRequest().userId;
      const user = await this.userRepository.findOne({
        where: { id: userId, ...isActive },
        relations: ['wishlist'],
      });

      const product = await this.productRepository.findOne({
        id,
        ...isActive,
      });

      if (user.wishlist) {
        user.wishlist = user.wishlist.filter(
          (currentProduct) => currentProduct.id !== product.id,
        );
      }
      await this.userRepository.save(user);
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  async findByShopPagination(
    id: string,
    page: number,
    limit: number,
  ): Promise<[ProductDto[], number]> {
    try {
      const shop = await this.getShop(id);

      const products = await this.productRepository.findAndCount({
        where: {
          shop,
          ...isActive,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { updatedAt: 'DESC' },
      });
      return this.conversionService.toPagination<ProductEntity, ProductDto>(
        products,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }
  /*********************** for frontend end ***********************/

  async findById(id: string, relation = true): Promise<ProductDto> {
    try {
      const product = await this.productRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation
          ? [
              'user',
              'shop',
              'category',
              'productAttributes',
              'productAttributes.attributes',
              'productAttributes.attributes.attributeGroup',
            ]
          : [],
      });
      return this.conversionService.toDto<ProductEntity, ProductDto>(product);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: ProductDto): Promise<ProductDto[]> {
    try {
      const products = await this.productRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<ProductEntity, ProductDto>(products);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByUser(id: string, relation = false): Promise<ProductDto[]> {
    try {
      const user = await this.getUser(id);
      const products = await this.productRepository.find({
        where: {
          user,
          ...isActive,
        },
        relations: relation ? ['category'] : [],
      });
      return this.conversionService.toDtos<ProductEntity, ProductDto>(products);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateProductDto): Promise<ProductDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        ProductEntity,
        ProductDto
      >(dto);

      const product = await this.productRepository.create(dtoToEntity);

      product.user = await this.getUser(dto.userID);
      product.shop = await this.getShop(dto.shopID);
      product.location = product.shop?.location;
      product.geoLocation = product.shop?.geoLocation;
      product.category = await this.getCategory(dto.categoryID);
      product.rating = 0;
      await this.productRepository.save(product);

      const productDto = await this.conversionService.toDto<
        ProductEntity,
        ProductDto
      >(product);
      this.indexProductSearch(productDto);
      await this.processStockPurchase(dto, product);
      return productDto;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async processStockPurchase(dto: CreateProductDto, product: ProductEntity): Promise<void> {
    try {
      if (dto.hasProductAttribute) {
        return;
      }
      const stockPurchase = new StockPurchaseEntity();
      stockPurchase.createAt = new Date();
      stockPurchase.updatedAt = new Date();
      stockPurchase.createdBy = product.createdBy;
      stockPurchase.updatedBy = product.updatedBy;
      stockPurchase.product = product;
      stockPurchase.quantity = product.quantity;
      stockPurchase.purchasedPrice = product.purchasedPrice;
      await this.stockPurchaseRepository.save(stockPurchase);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateProductDto): Promise<ProductDto> {
    try {
      const oldProduct = await this.getProduct(id);

      if (dto.userID) oldProduct.user = await this.getUser(dto.userID);
      if (dto.shopID) oldProduct.shop = await this.getShop(dto.shopID);
      if (dto.categoryID)
        oldProduct.category = await this.getCategory(dto.categoryID);

      const savedDto = { ...oldProduct, ...dto };
      const productEntity = await this.conversionService.toEntity<
        ProductEntity,
        ProductDto
      >(savedDto);

      const updatedProduct = await this.productRepository.save(productEntity, {
        reload: true,
      });

      const productDto = await this.conversionService.toDto<
        ProductEntity,
        ProductDto
      >(updatedProduct);
      this.indexProductSearch(productDto);
      return productDto;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getProduct(id);

      const deleted = await this.productRepository.save({
        ...saveDto,
        ...isInActive,
      });

      this.removeProductFromIndex(id);
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /*********************************** relations ******************************/

  getProduct = async (id: string): Promise<ProductEntity> => {
    const product = await this.productRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(product, 'Product not found!!');
    return product;
  };

  getUser = async (id: string): Promise<UserEntity> => {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(user, 'User not found!!');
    return user;
  };

  getShop = async (id: string): Promise<ShopEntity> => {
    const shop = await this.shopRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(shop, 'Shop Not Found!!');
    return shop;
  };

  getCategory = async (id: string): Promise<CategoryEntity> => {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(category, 'Category Not Found!!');
    return category;
  };

  indexProductSearch = (productDto: ProductDto) => {
    this.searchClient
      .send({ service: 'products', cmd: 'post', method: 'index' }, productDto)
      .subscribe();
  };

  removeProductFromIndex = (id: string) => {
    this.searchClient
      .send({ service: 'product', cmd: 'delete', method: 'remove' }, id)
      .subscribe();
  };
}
