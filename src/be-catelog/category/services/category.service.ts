import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CategoryDto,
  CategoryEntity,
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  ProductEntity,
  SystemException,
} from '@simec/ecom-common';
import { Repository, TreeRepository } from 'typeorm';
import EcomCacheService from '../../../cache/ecom-cache.service';
import { EcomCatelogCacheKeyEnum } from '../../../cache/ecom-cache-key.enum';

@Injectable()
export class CategoryService implements GeneralService<CategoryDto> {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryTreeRepository: TreeRepository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly ecomCacheService: EcomCacheService,
  ) {}

  async findAll(): Promise<CategoryDto[]> {
    try {
      const categories = await this.categoryRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<CategoryEntity, CategoryDto>(
        categories,
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
  ): Promise<[CategoryDto[], number]> {
    try {
      const categories = await this.categoryRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<CategoryEntity, CategoryDto>(
        categories,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<CategoryDto> {
    try {
      const category = await this.categoryRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['parent'] : [],
      });
      return this.conversionService.toDto<CategoryEntity, CategoryDto>(
        category,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: CategoryDto): Promise<CategoryDto[]> {
    try {
      const categories = await this.categoryRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<CategoryEntity, CategoryDto>(
        categories,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CategoryDto): Promise<CategoryDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        CategoryEntity,
        CategoryDto
      >(dto);

      const category = this.categoryRepository.create(dtoToEntity);
      await this.categoryRepository.save(category);

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_FIND_ALL,
      );

      return this.conversionService.toDto<CategoryEntity, CategoryDto>(
        category,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CategoryDto): Promise<CategoryDto> {
    try {
      const savedCategory = await this.getCategory(id);

      const dtoToEntity = await this.conversionService.toEntity<
        CategoryEntity,
        CategoryDto
      >({ ...savedCategory, ...dto });

      const updatedCategory = await this.categoryRepository.save(dtoToEntity, {
        reload: true,
      });

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_FIND_ALL,
      );

      return this.conversionService.toDto<CategoryEntity, CategoryDto>(
        updatedCategory,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getCategory(id);

      const deleted = await this.categoryRepository.save({
        ...saveDto,
        ...isInActive,
      });

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_FIND_ALL,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_TREES,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_PRODUCTS_FOR_HOME,
      );

      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async createChild(id: string, dto: CategoryDto): Promise<CategoryDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        CategoryEntity,
        CategoryDto
      >(dto);

      const category = this.categoryRepository.create(dtoToEntity);

      category.parent = await this.getCategory(id);
      await this.categoryRepository.save(category);

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_FIND_ALL,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_TREES,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_PRODUCTS_FOR_HOME,
      );

      return this.conversionService.toDto<CategoryEntity, CategoryDto>(
        category,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async updateChild(
    id: string,
    parentID: string,
    dto: CategoryDto,
  ): Promise<CategoryDto> {
    try {
      const savedCategory = await this.getCategory(id);

      if (parentID) {
        savedCategory.parent = await this.getCategory(parentID);
      }

      const dtoToEntity = await this.conversionService.toEntity<
        CategoryEntity,
        CategoryDto
      >({ ...savedCategory, ...dto });

      const updatedCategory = await this.categoryRepository.save(dtoToEntity, {
        reload: true,
      });

      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_FIND_ALL,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_TREES,
      );
      await this.ecomCacheService.clearCache(
        EcomCatelogCacheKeyEnum.CATEGORY_PRODUCTS_FOR_HOME,
      );

      return this.conversionService.toDto<CategoryEntity, CategoryDto>(
        updatedCategory,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findTrees(): Promise<CategoryDto[]> {
    try {
      const categories = await this.categoryTreeRepository.findTrees();
      return this.conversionService.toDtos<CategoryEntity, CategoryDto>(
        categories,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findRoots(): Promise<CategoryDto[]> {
    try {
      const categories = await this.categoryTreeRepository.findRoots();
      return this.conversionService.toDtos<CategoryEntity, CategoryDto>(
        categories,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findChildren(id: string): Promise<CategoryDto> {
    try {
      const parentDto = await this.getCategory(id);

      const categories = await this.categoryTreeRepository.findDescendantsTree(
        parentDto,
      );
      return this.conversionService.toDto<CategoryEntity, CategoryDto>(
        categories,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findParent(id: string): Promise<CategoryDto> {
    try {
      const childCategory = await this.getCategory(id);

      const category = await this.categoryTreeRepository.findAncestorsTree(
        childCategory,
      );
      return this.conversionService.toDto<CategoryEntity, CategoryDto>(
        category,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /******************** relation ****************/
  getCategory = async (id: string): Promise<CategoryEntity> => {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });

    this.exceptionService.notFound(category, 'Category not found!!');
    return category;
  };
}
