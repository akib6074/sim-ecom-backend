import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  CreateProductReviewDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  PermissionService,
  ProductEntity,
  ProductReviewDto,
  ProductReviewEntity,
  SystemException,
  UserEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class ProductReviewService implements GeneralService<ProductReviewDto> {
  constructor(
    @InjectRepository(ProductReviewEntity)
    private readonly productReviewRepository: Repository<ProductReviewEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(): Promise<ProductReviewDto[]> {
    try {
      const productReviews = await this.productReviewRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<
        ProductReviewEntity,
        ProductReviewDto
      >(productReviews);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ProductReviewDto[], number]> {
    try {
      const productReviews = await this.productReviewRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<
        ProductReviewEntity,
        ProductReviewDto
      >(productReviews);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: ProductReviewDto): Promise<ProductReviewDto[]> {
    try {
      const productReviews = await this.productReviewRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        ProductReviewEntity,
        ProductReviewDto
      >(productReviews);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateProductReviewDto): Promise<ProductReviewDto> {
    try {
      const userId = this.permissionService.returnRequest().userId;

      const dtoToEntity = await this.conversionService.toEntity<
        ProductReviewEntity,
        ProductReviewDto
      >(dto);
      const productReview = this.productReviewRepository.create(dtoToEntity);

      const product = await this.productRepository.findOne({
        where: { id: dto.productID, ...isActive },
        relations: ['productReviews'],
      });

      product.rating =
        (product.rating * product?.productReviews?.length +
          productReview.productRating) /
        (product?.productReviews?.length + 1);

      productReview.product = product;

      const user = await this.userRepository.findOne({
        id: userId,
        ...isActive,
      });

      productReview.user = user;

      await this.productReviewRepository.save(productReview);
      product.productReviews.push(productReview);
      await this.productRepository.save(product);

      const savedProductReview = await this.productReviewRepository.findOne({
        where: {
          ...isActive,
          id: productReview.id,
        },
        relations: ['product', 'user', 'user.profile'],
      });
      return this.conversionService.toDto<
        ProductReviewEntity,
        ProductReviewDto
      >(savedProductReview);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: ProductReviewDto): Promise<ProductReviewDto> {
    try {
      const savedProductReview = await this.getReviewById(id);

      const dtoToEntity = await this.conversionService.toEntity<
        ProductReviewEntity,
        ProductReviewDto
      >({ ...savedProductReview, ...dto });

      const updatedProductReview = await this.productReviewRepository.save(
        dtoToEntity,
        {
          reload: true,
        },
      );

      return this.conversionService.toDto<
        ProductReviewEntity,
        ProductReviewDto
      >(updatedProductReview);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveProductReview = await this.getReviewById(id);

      const deleted = await this.productReviewRepository.save({
        ...saveProductReview,
        ...isInActive,
      });

      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<ProductReviewDto> {
    try {
      const productReview = await this.productReviewRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['product'] : [],
      });
      return this.conversionService.toDto<
        ProductReviewEntity,
        ProductReviewDto
      >(productReview);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /******************** relation ****************/
  getReviewById = async (id: string): Promise<ProductReviewEntity> => {
    const productReview = await this.productReviewRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(productReview, 'Review not found!!');
    return productReview;
  };

  findByProductId = async (id: string): Promise<ProductReviewDto[]> => {
    try {
      const productReviews = await this.productReviewRepository
        .createQueryBuilder('R')
        .leftJoinAndSelect('R.product', 'product')
        .leftJoinAndSelect('R.user', 'user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where('R.isActive = :isActive', { isActive: isActive.isActive })
        .andWhere('product.id = :id', { id })
        .getMany();

      return this.conversionService.toDtos<
        ProductReviewEntity,
        ProductReviewDto
      >(productReviews);
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
