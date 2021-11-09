import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CategoryEntity,
  ConversionService,
  CreatePromotionDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  ProductEntity,
  PromotionDto,
  PromotionEntity,
  PromotionType,
  ShopEntity,
  ShopTypeEntity,
  SystemException,
  UserEntity,
  PermissionService,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class PromotionService implements GeneralService<PromotionDto> {
  private readonly logger = new Logger(PromotionService.name);
  private readonly searchClient: ClientProxy;

  constructor(
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ShopTypeEntity)
    private readonly shopTypeRepository: Repository<ShopTypeEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(): Promise<PromotionDto[]> {
    try {
      const promotions = await this.promotionRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<PromotionEntity, PromotionDto>(
        promotions,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async getLatestPromotions(): Promise<PromotionDto[]> {
    try {
      const promotions = await this.promotionRepository.find({
        where: { ...isActive, type: PromotionType.Banner },
        relations: ['shop', 'product'],
        take: 3,
        order: {
          ['updatedAt']: 'DESC',
        },
      });
      return this.conversionService.toDtos<PromotionEntity, PromotionDto>(
        promotions,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[PromotionDto[], number]> {
    try {
      const userResponse = await this.permissionService.returnRequest();
      const user = await this.userRepository.findOne({
        where: { ...isActive, id: userResponse.userId },
      });
      let where: any = { ...isActive };
      if (userResponse.isMerchant) {
        where = { ...where, user: user };
      }

      const promotions = await this.promotionRepository.findAndCount({
        where: { ...where },
        relations: ['shop', 'product'],
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<PromotionEntity, PromotionDto>(
        promotions,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: PromotionDto): Promise<PromotionDto[]> {
    try {
      const promotions = await this.promotionRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<PromotionEntity, PromotionDto>(
        promotions,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreatePromotionDto): Promise<PromotionDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        PromotionEntity,
        PromotionDto
      >(dto);
      const userId = this.permissionService.returnRequest().userId;
      const promotion = this.promotionRepository.create(dtoToEntity);
      promotion.shop = await this.getShopById(dto.shopID);
      promotion.shopType = await this.getShopTypeById(dto.shopTypeID);
      promotion.product = await this.getProductById(dto.productID);
      promotion.category = await this.getCategoryById(dto.categoryID);
      promotion.user = await this.getUserById(userId);
      await this.promotionRepository.save(promotion);
      return this.conversionService.toDto<PromotionEntity, PromotionDto>(
        promotion,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: PromotionDto): Promise<PromotionDto> {
    try {
      const savedPromotion = await this.getPromotionById(id);

      const dtoToEntity = await this.conversionService.toEntity<
        PromotionEntity,
        PromotionDto
      >({ ...savedPromotion, ...dto });

      const updatedPromotion = await this.promotionRepository.save(
        dtoToEntity,
        {
          reload: true,
        },
      );

      return this.conversionService.toDto<PromotionEntity, PromotionDto>(
        updatedPromotion,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const savePromotion = await this.getPromotionById(id);

      const deleted = await this.promotionRepository.save({
        ...savePromotion,
        ...isInActive,
      });

      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<PromotionDto> {
    try {
      const promotion = await this.promotionRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? [] : [],
      });
      return this.conversionService.toDto<PromotionEntity, PromotionDto>(
        promotion,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /******************** relation ****************/
  getPromotionById = async (id: string): Promise<PromotionEntity> => {
    const promotion = await this.promotionRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(promotion, 'Promotion not found!!');
    return promotion;
  };

  getShopById = async (id: string): Promise<ShopEntity> => {
    const shop = await this.shopRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(shop, 'Shop not found!!');
    return shop;
  };

  getShopTypeById = async (id: string): Promise<ShopTypeEntity> => {
    const shopType = await this.shopTypeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(shopType, 'Shop Type not found!!');
    return shopType;
  };

  getProductById = async (id: string): Promise<ProductEntity> => {
    const product = await this.productRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(product, 'Product not found!!');
    return product;
  };

  getCategoryById = async (id: string): Promise<CategoryEntity> => {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(category, 'Category not found!!');
    return category;
  };

  getUserById = async (id: string): Promise<UserEntity> => {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(user, 'User not found!!');
    return user;
  };
}
