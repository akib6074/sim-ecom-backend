import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  ShopDto,
  ShopTypeDto,
  ShopTypeEntity,
  SystemException,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';
import EcomCacheService from '../../../cache/ecom-cache.service';
import { EcomCatelogCacheKeyEnum } from '../../../cache/ecom-cache-key.enum';

@Injectable()
export class ShopTypeService implements GeneralService<ShopTypeDto> {
  private readonly logger = new Logger(ShopTypeService.name);

  constructor(
    @InjectRepository(ShopTypeEntity)
    private readonly typeRepository: Repository<ShopTypeEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly ecomCacheService: EcomCacheService,
  ) {}

  async findAll(): Promise<ShopTypeDto[]> {
    try {
      const types = await this.typeRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<ShopTypeEntity, ShopTypeDto>(types);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ShopTypeDto[], number]> {
    try {
      const types = await this.typeRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      console.log('pagination called🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥', types);

      return this.conversionService.toPagination<ShopTypeEntity, ShopTypeDto>(
        types,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: ShopTypeDto): Promise<ShopTypeDto[]> {
    try {
      const types = await this.typeRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<ShopTypeEntity, ShopTypeDto>(types);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: ShopTypeDto): Promise<ShopTypeDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        ShopTypeEntity,
        ShopTypeDto
      >(dto);

      const type = this.typeRepository.create(dtoToEntity);
      await this.typeRepository.save(type);

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.TYPES_FIND_ALL,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.TYPES_SHOPS_FOR_HOME,
      );

      return this.conversionService.toDto<ShopTypeEntity, ShopTypeDto>(type);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: ShopTypeDto): Promise<ShopTypeDto> {
    try {
      const savedType = await this.getType(id);

      const dtoToEntity = await this.conversionService.toEntity<
        ShopTypeEntity,
        ShopTypeDto
      >({ ...savedType, ...dto });

      const updatedType = await this.typeRepository.save(dtoToEntity, {
        reload: true,
      });

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.TYPES_FIND_ALL,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.TYPES_SHOPS_FOR_HOME,
      );

      return this.conversionService.toDto<ShopTypeEntity, ShopTypeDto>(
        updatedType,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getType(id);

      const deleted = await this.typeRepository.save({
        ...saveDto,
        ...isInActive,
      });

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.TYPES_FIND_ALL,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.TYPES_SHOPS_FOR_HOME,
      );

      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<ShopTypeDto> {
    try {
      const type = await this.typeRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['parent'] : [],
      });
      return this.conversionService.toDto<ShopTypeEntity, ShopTypeDto>(type);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /******************** relation ****************/
  getType = async (id: string): Promise<ShopTypeEntity> => {
    const type = await this.typeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(type, 'Type not found!!');
    return type;
  };

  convertToDtos(shopTypes: any[]): Promise<ShopTypeDto[]> {
    //console.log(shopTypes);
    const keyObj = shopTypes.reduce((obj, type) => {
      let shopTypeDto = obj[type.shopType_id];
      const shopDto = this.generateShopDto(type);
      if (shopTypeDto) {
        shopTypeDto.shops.push(shopDto);
      } else {
        shopTypeDto = this.generateShopTypeDto(type);
        shopTypeDto.shops = [];
        shopTypeDto.shops.push(shopDto);
      }
      obj[type.shopType_id] = shopTypeDto;
      return obj;
    }, {});
    const shopTypesRes = [];
    for (const key in keyObj) {
      shopTypesRes.push(keyObj[key]);
    }
    return Promise.resolve(shopTypesRes);
  }

  generateShopTypeDto(shopType: any): ShopTypeDto {
    const shopTypeDto = new ShopTypeDto();
    shopTypeDto.id = shopType.shopType_id;
    shopTypeDto.name = shopType.shopType_name;
    return shopTypeDto;
  }

  generateShopDto(shop: any): ShopDto {
    const shopDto = new ShopDto();
    shopDto.id = shop.shop_id;
    shopDto.name = shop.shop_name;
    shopDto.domain = shop.shop_domain;
    shopDto.url = shop.shop_url;
    shopDto.location = shop.shop_location;
    shopDto.geoLocation = shop.shop_geo_location;
    shopDto.shopProfileImage = shop.shop_shop_profile_image;
    shopDto.shopCoverImage = shop.shop_shop_cover_image;
    return shopDto;
  }
}
