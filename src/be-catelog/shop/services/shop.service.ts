import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CreateShopDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  MerchantEntity,
  PermissionService,
  PromotionDto,
  PromotionEntity,
  ShopDto,
  ShopEntity,
  ShopTypeEntity,
  SystemException,
  UserDto,
  UserEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class ShopService implements GeneralService<ShopDto> {
  private readonly searchClient: ClientProxy;

  constructor(
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
    @InjectRepository(MerchantEntity)
    private readonly merchantRepository: Repository<MerchantEntity>,
    @InjectRepository(ShopTypeEntity)
    private readonly typeRepository: Repository<ShopTypeEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
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

  async findAll(): Promise<ShopDto[]> {
    try {
      const shops = await this.shopRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findPopularShops(): Promise<ShopDto[]> {
    try {
      const shops = await this.shopRepository.find({
        where: { ...isActive },
        take: 4,
        order: { popular: 'DESC' }
      });
      return this.conversionService.toDtos<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findTrendingShops(): Promise<ShopDto[]> {
    try {
      const shops = await this.shopRepository.find({
        where: { ...isActive },
        take: 4,
        order: { trending: 'DESC' }
      });
      return this.conversionService.toDtos<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ShopDto[], number]> {
    try {
      const userId = this.permissionService.returnRequest().userId;
      const where = { ...isActive };
      const user = await this.userRepository.findOne({
        where: { ...isActive, id: userId },
        relations: ['merchant'],
      });

      if (user.merchant) {
        where['merchant'] = user.merchant;
      }

      const shops = await this.shopRepository.findAndCount({
        where: { ...where },
        take: limit,
        skip: (page - 1) * limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
        relations: ['shopType'],
      });
      return this.conversionService.toPagination<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  followShop = async (shopId: string, userId: string): Promise<UserDto> => {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, ...isActive },
        relations: ['followingShops'],
      });

      const shop = await this.shopRepository.findOne({
        id: shopId,
        ...isActive,
      });
      if (user.followingShops) {
        user.followingShops.push(shop);
      } else {
        user.followingShops = [shop];
      }
      await this.userRepository.save(user);
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  unFollowShop = async (id: string): Promise<UserDto> => {
    try {
      const userId = this.permissionService.returnRequest().userId;
      const user = await this.userRepository.findOne({
        where: { id: userId, ...isActive },
        relations: ['followingShops'],
      });

      const shop = await this.shopRepository.findOne({
        id,
        ...isActive,
      });

      if (user.followingShops) {
        console.log('befor:', user.followingShops.length);
        user.followingShops = user.followingShops.filter(
          (curShop) => curShop.id !== shop.id,
        );
        console.log('after:', user.followingShops.length);
      }
      await this.userRepository.save(user);
      return this.conversionService.toDto<UserEntity, UserDto>(user);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  async findById(id: string, relation = true): Promise<ShopDto> {
    try {
      const shop = await this.shopRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['shopType', 'merchant'] : [],
      });
      return this.conversionService.toDto<ShopEntity, ShopDto>(shop);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: ShopDto): Promise<ShopDto[]> {
    try {
      const shops = await this.shopRepository.find({
        where: { ...dto, ...isActive },
      });
      return this.conversionService.toDtos<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /*********************** for frontend start ***********************/
  async findByTypePagination(
    id: string,
    page: number,
    limit: number,
    rating: string,
    algorithm: string,
  ): Promise<[ShopDto[], number]> {
    try {
      const shopType = await this.getShopType(id);
      let order = {};
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
      const shops = await this.shopRepository.findAndCount({
        where: {
          shopType,
          ...isActive,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: order,
      });
      return this.conversionService.toPagination<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findLatestPromotionsByType(id: string): Promise<PromotionDto[]> {
    const shopType = await this.getShopType(id);

    const promotions = await this.promotionRepository.find({
      where: {
        shopType,
        ...isActive,
      },
      relations: ['shop'],
      take: 2,
      order: { updatedAt: 'DESC' },
    });
    return this.conversionService.toDtos<PromotionEntity, PromotionDto>(
      promotions,
    );
  }

  async findByName(name: string): Promise<ShopDto> {
    try {
      const shop = await this.shopRepository.findOne({
        where: { name, ...isActive },
        relations: ['shopType'],
      });
      return this.conversionService.toDto<ShopEntity, ShopDto>(shop);
    } catch (error) {
      throw new SystemException(error);
    }
  }
  /*********************** for frontend end ***********************/

  async findByMerchant(id: string, relation = false): Promise<ShopDto[]> {
    try {
      const user = await this.getUserMerchant(id);
      const merchant = user.merchant;
      const shops = await this.shopRepository.find({
        where: {
          merchant,
          ...isActive,
        },
        relations: relation ? ['shopType'] : [],
      });
      return this.conversionService.toDtos<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByType(id: string): Promise<ShopDto[]> {
    try {
      const shopType = await this.getShopType(id);
      const shops = await this.shopRepository.find({
        where: {
          shopType,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<ShopEntity, ShopDto>(shops);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async shopCountByMerchant(id: string): Promise<any> {
    const userRepo = this.userRepository.createQueryBuilder('user');
    const user = await userRepo
      .innerJoinAndSelect('user.merchant', 'merchant')
      .where('user.id=:id', { id })
      .getOne();
    const merchantId = user.merchant.id;
    const shopRepo = this.shopRepository.createQueryBuilder('shop');
    const shops = await shopRepo
      .leftJoin('shop.merchant', 'merchant')
      .where('merchant.id=:id', { id: merchantId })
      .getCount();
    return shops;
  }

  async create(dto: CreateShopDto): Promise<ShopDto> {
    try {
      const merchant = await this.getMerchant(dto.merchantID);
      const shopCount = await this.shopRepository.count({
        where: {
          merchant,
          ...isActive,
        },
      });

      if (shopCount <= 1000) {
        const dtoToEntity = await this.conversionService.toEntity<
          ShopEntity,
          ShopDto
        >(dto);

        dtoToEntity.merchant = merchant;

        dtoToEntity.shopType = await this.getShopType(dto.shopTypeID);

        const shop = this.shopRepository.create(dtoToEntity);
        shop.rating = 0;
        await this.shopRepository.save(shop);
        const shopDto = await this.conversionService.toDto<ShopEntity, ShopDto>(
          shop,
        );
        this.indexShopSearch(shopDto);
        return shopDto;
      } else {
        const error = { message: 'You have exceeded your shop limit!' };
        throw new SystemException(error);
      }
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateShopDto): Promise<ShopDto> {
    try {
      const saveDto = await this.getShop(id);

      if (dto.merchantID) {
        saveDto.merchant = await this.getMerchant(dto.merchantID);
      }

      if (dto.shopTypeID) {
        saveDto.shopType = await this.getShopType(dto.shopTypeID);
      }

      const dtoToEntity = await this.conversionService.toEntity<
        ShopEntity,
        ShopDto
      >({ ...saveDto, ...dto });

      const updatedDto = await this.shopRepository.save(dtoToEntity, {
        reload: true,
      });

      const shopDto = await this.conversionService.toDto<ShopEntity, ShopDto>(
        updatedDto,
      );
      this.indexShopSearch(shopDto);
      return shopDto;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getShop(id);

      const deleted = await this.shopRepository.save({
        ...saveDto,
        ...isInActive,
      });
      this.removeShopFromIndex(id);
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** relations **********************/

  getShop = async (id: string): Promise<ShopEntity> => {
    const shop = await this.shopRepository.findOne({
      where: {
        id,
        ...isActive,
      },
      relations: ['shopType'],
    });
    this.exceptionService.notFound(shop, 'Shop not found!!');
    return shop;
  };

  getUserMerchant = async (id: string): Promise<UserEntity> => {
    const query = this.userRepository.createQueryBuilder('user');
    const user = await query
      .innerJoinAndSelect('user.merchant', 'merchant')
      .where('user.id=:id', { id })
      .getOne();
    this.exceptionService.notFound(user, 'Merchant not found!!');
    return user;
  };

  getMerchant = async (id: string): Promise<MerchantEntity> => {
    const merchant = await this.merchantRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(merchant, 'Merchant not found!!');
    return merchant;
  };

  getShopType = async (id: string): Promise<ShopTypeEntity> => {
    const shopType = await this.typeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(shopType, 'Shop Type not found!!');
    return shopType;
  };

  indexShopSearch = (shopDto: ShopDto) => {
    this.searchClient
      .send({ service: 'shops', cmd: 'post', method: 'index' }, shopDto)
      .subscribe();
  };

  removeShopFromIndex = (id: string) => {
    this.searchClient
      .send({ service: 'shops', cmd: 'delete', method: 'remove' }, id)
      .subscribe();
  };
}
