import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CategoryEntity,
  ConversionService,
  CouponEntity,
  CreateCouponDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  PermissionService,
  ProductAttributeEntity,
  ProductEntity,
  ShopDto,
  ShopEntity,
  SystemException,
  ThanaEntity,
  UserEntity,
} from '@simec/ecom-common';
import { CouponDto } from '@simec/ecom-common/dist/dto/coupon/coupon.dto';
import { Repository, In } from 'typeorm';

@Injectable()
export class CouponService implements GeneralService<CouponDto> {
  private readonly searchClient: ClientProxy;

  constructor(
    @InjectRepository(CouponEntity)
    private readonly couponRepository: Repository<CouponEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductAttributeEntity)
    private readonly productAttributeRepository: Repository<ProductAttributeEntity>,
    @InjectRepository(ThanaEntity)
    private readonly thanaRepository: Repository<ThanaEntity>,
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

  /*********************** for admin start ************************/
  async findAll(): Promise<CouponDto[]> {
    try {
      const shops = await this.couponRepository.find({
        where: { ...isActive },
        relations: [
          'users',
          'shops',
          'products',
          'categories',
          'thanas',
          'carts',
        ],
      });
      return this.conversionService.toDtos<CouponEntity, CouponDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, withRelation = true): Promise<CouponDto> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: {
          id,
          ...isActive,
        },
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

  async findByObject(dto: CouponDto): Promise<CouponDto[]> {
    try {
      const coupons = await this.couponRepository.find({
        where: { ...dto, ...isActive },
      });
      return this.conversionService.toDtos<CouponEntity, CouponDto>(coupons);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByCouponCode(
    code: string,
    withRelation = true,
  ): Promise<CouponDto> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { code, ...isActive },
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

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
    withRelations = false,
  ): Promise<[CouponDto[], number]> {
    try {
      const where = { ...isActive };
      const coupons = await this.couponRepository.findAndCount({
        where: { ...where },
        take: limit,
        skip: (page - 1) * limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
        relations:
          withRelations === true
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
      return this.conversionService.toPagination<CouponEntity, CouponDto>(
        coupons,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateCouponDto): Promise<CouponDto> {
    try {
      const users = await this.userRepository
        .createQueryBuilder()
        .whereInIds(dto.userIDs)
        .getMany();
      const categories = await this.categoryRepository
        .createQueryBuilder()
        .whereInIds(dto.categorieIDs)
        .getMany();
      const products = await this.productRepository
        .createQueryBuilder()
        .whereInIds(dto.productIDs)
        .getMany();
      const shops = await this.shopRepository
        .createQueryBuilder()
        .whereInIds(dto.shopIDs)
        .getMany();
      const thanas = await this.thanaRepository
        .createQueryBuilder()
        .whereInIds(dto.thanasIDs)
        .getMany();

      const freeProduct = await this.productRepository.findOne({
        id: dto.freeProductID,
      });

      const freeProductAttribute =
        await this.productAttributeRepository.findOne({
          id: dto.freeProductAttributeID,
        });

      const dtoToEntity = await this.conversionService.toEntity<
        CouponEntity,
        CouponDto
      >(dto);
      dtoToEntity.users = users;
      dtoToEntity.categories = categories;
      dtoToEntity.products = products;
      dtoToEntity.shops = shops;
      dtoToEntity.thanas = thanas;
      dtoToEntity.freeProduct = freeProduct;
      dtoToEntity.freeProductAttribute = freeProductAttribute;
      // console.log(dtoToEntity);

      const coupon = await this.couponRepository.create(dtoToEntity);
      await this.couponRepository.save(coupon);

      const couponDto = await this.conversionService.toDto<
        CouponEntity,
        CouponDto
      >(coupon);

      return couponDto;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateCouponDto): Promise<CouponDto> {
    try {
      const saveDto = await this.findById(id);
      const dtoToEntity = await this.conversionService.toEntity<
        CouponEntity,
        CouponDto
      >({ ...saveDto, ...dto });
      if (dto.userIDs && dto.userIDs.length > 0) {
        const users = await this.userRepository
          .createQueryBuilder()
          .whereInIds(dto.userIDs)
          .getMany();
        dtoToEntity.users = users;
      }
      if (dto.categorieIDs && dto.categorieIDs.length > 0) {
        const categories = await this.categoryRepository
          .createQueryBuilder()
          .whereInIds(dto.categorieIDs)
          .getMany();
        dtoToEntity.categories = categories;
      }
      if (dto.productIDs && dto.productIDs.length > 0) {
        const products = await this.productRepository
          .createQueryBuilder()
          .whereInIds(dto.productIDs)
          .getMany();
        dtoToEntity.products = products;
      }
      if (dto.shopIDs && dto.shopIDs.length > 0) {
        const shops = await this.shopRepository
          .createQueryBuilder()
          .whereInIds(dto.shopIDs)
          .getMany();
        dtoToEntity.shops = shops;
      }
      if (dto.thanasIDs && dto.thanasIDs.length > 0) {
        const thanas = await this.thanaRepository
          .createQueryBuilder()
          .whereInIds(dto.thanasIDs)
          .getMany();
        dtoToEntity.thanas = thanas;
      }
      if (dto.freeProductID) {
        const freeProduct = await this.productRepository.findOne({
          id: dto.freeProductID,
        });
        dtoToEntity.freeProduct = freeProduct;
      }

      if (dto.freeProductAttributeID) {
        const freeProductAttribute =
          await this.productAttributeRepository.findOne({
            id: dto.freeProductAttributeID,
          });
        dtoToEntity.freeProductAttribute = freeProductAttribute;
      }

      console.log(dtoToEntity);
      const updatedDto = await this.couponRepository.save(dtoToEntity, {
        reload: true,
      });

      const couponUpdate = await this.conversionService.toDto<
        CouponEntity,
        CouponDto
      >(updatedDto);
      return couponUpdate;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const couponDto = await this.findById(id);
      const countEntity = await this.conversionService.toEntity<
        CouponEntity,
        CouponDto
      >(couponDto);
      const deleted = await this.couponRepository.save({
        ...countEntity,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }
}
