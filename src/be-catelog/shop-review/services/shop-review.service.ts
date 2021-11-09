import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  PermissionService,
  ShopEntity,
  ShopReviewDto,
  ShopReviewEntity,
  SystemException,
  UserEntity,
  CreateShopReviewDto,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class ShopReviewService implements GeneralService<ShopReviewDto> {
  private readonly logger = new Logger(ShopReviewService.name);

  constructor(
    @InjectRepository(ShopReviewEntity)
    private readonly shopReviewRepository: Repository<ShopReviewEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(): Promise<ShopReviewDto[]> {
    try {
      const shopReview = await this.shopReviewRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<ShopReviewEntity, ShopReviewDto>(
        shopReview,
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
  ): Promise<[ShopReviewDto[], number]> {
    try {
      const shopReviews = await this.shopReviewRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<
        ShopReviewEntity,
        ShopReviewDto
      >(shopReviews);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: ShopReviewDto): Promise<ShopReviewDto[]> {
    try {
      const shopReviews = await this.shopReviewRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<ShopReviewEntity, ShopReviewDto>(
        shopReviews,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateShopReviewDto): Promise<ShopReviewDto> {
    try {
      const userId = this.permissionService.returnRequest().userId;

      const dtoToEntity = await this.conversionService.toEntity<
        ShopReviewEntity,
        ShopReviewDto
      >(dto);
      const shopReview = this.shopReviewRepository.create(dtoToEntity);

      const shop = await this.shopRepository.findOne({
        where: { id: dto.shopID, ...isActive },
        relations: ['reviews'],
      });

      shop.rating =
        (shop.rating * shop?.reviews?.length + shopReview.shopRating) /
        (shop?.reviews?.length + 1);

      shopReview.shop = shop;

      const user = await this.userRepository.findOne({
        id: userId,
        ...isActive,
      });
      shopReview.user = user;

      await this.shopReviewRepository.save(shopReview);
      shop.reviews.push(shopReview);
      await this.shopRepository.save(shop);

      const savedShopReview = await this.shopReviewRepository.findOne({
        where: {
          ...isActive,
          id: shopReview.id,
        },
        relations: ['shop', 'user', 'user.profile'],
      });

      return this.conversionService.toDto<ShopReviewEntity, ShopReviewDto>(
        savedShopReview,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: ShopReviewDto): Promise<ShopReviewDto> {
    try {
      const savedShopReview = await this.getReviewById(id);

      const dtoToEntity = await this.conversionService.toEntity<
        ShopReviewEntity,
        ShopReviewDto
      >({ ...savedShopReview, ...dto });

      const updatedShopReview = await this.shopReviewRepository.save(
        dtoToEntity,
        {
          reload: true,
        },
      );

      return this.conversionService.toDto<ShopReviewEntity, ShopReviewDto>(
        updatedShopReview,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveShopReviewDto = await this.getReviewById(id);

      const deleted = await this.shopReviewRepository.save({
        ...saveShopReviewDto,
        ...isInActive,
      });

      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<ShopReviewDto> {
    try {
      const shopReview = await this.shopReviewRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? [] : [],
      });
      return this.conversionService.toDto<ShopReviewEntity, ShopReviewDto>(
        shopReview,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /******************** relation ****************/
  getReviewById = async (id: string): Promise<ShopReviewEntity> => {
    const shopReview = await this.shopReviewRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(shopReview, 'Review not found!!');
    return shopReview;
  };

  findByShopId = async (id: string): Promise<ShopReviewDto[]> => {
    try {
      const shopReviews = await this.shopReviewRepository
        .createQueryBuilder('R')
        .leftJoinAndSelect('R.shop', 'shop')
        .leftJoinAndSelect('R.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where('R.isActive = :isActive', { isActive: isActive.isActive })
        .andWhere('shop.id = :id', { id })
        .getMany();

      return this.conversionService.toDtos<ShopReviewEntity, ShopReviewDto>(
        shopReviews,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
