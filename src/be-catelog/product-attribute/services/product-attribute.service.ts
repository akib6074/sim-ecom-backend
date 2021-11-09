import {Injectable, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AttributeEntity,
  ConversionService,
  CreateProductAttributeDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  ProductAttributeDto,
  ProductAttributeEntity,
  ProductEntity,
  SystemException,
  StockPurchaseEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class ProductAttributeService
  implements GeneralService<ProductAttributeDto>
{

  private readonly logger = new Logger(ProductAttributeService.name);

  constructor(
    @InjectRepository(ProductAttributeEntity)
    private readonly productAttributeRepository: Repository<ProductAttributeEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(AttributeEntity)
    private readonly attributeRepository: Repository<AttributeEntity>,
    @InjectRepository(StockPurchaseEntity)
    private readonly stockPurchaseRepository: Repository<StockPurchaseEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<ProductAttributeDto[]> {
    try {
      const productAttributes = await this.productAttributeRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<
        ProductAttributeEntity,
        ProductAttributeDto
      >(productAttributes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[ProductAttributeDto[], number]> {
    try {
      const productAttributes =
        await this.productAttributeRepository.findAndCount({
          where: { ...isActive },
          take: limit,
          skip: (page - 1) * limit,
          order: {
            [sort !== 'undefined' ? sort : 'updatedAt']:
              sort !== 'undefined' ? order : 'DESC',
          },
        });

      return this.conversionService.toPagination<
        ProductAttributeEntity,
        ProductAttributeDto
      >(productAttributes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string, relation = true): Promise<ProductAttributeDto> {
    try {
      const productAttribute = await this.productAttributeRepository.findOne({
        where: {
          id,
          ...isActive,
        },
        relations: relation ? ['product'] : [],
      });
      return this.conversionService.toDto<
        ProductAttributeEntity,
        ProductAttributeDto
      >(productAttribute);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(dto: ProductAttributeDto): Promise<ProductAttributeDto[]> {
    try {
      const productAttributes = await this.productAttributeRepository.find({
        where: {
          ...dto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        ProductAttributeEntity,
        ProductAttributeDto
      >(productAttributes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByProduct(id: string): Promise<ProductAttributeDto[]> {
    try {
      const product = await this.getProduct(id);
      const productAttributes = await this.productAttributeRepository.find({
        where: {
          product,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<
        ProductAttributeEntity,
        ProductAttributeDto
      >(productAttributes);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateProductAttributeDto): Promise<ProductAttributeDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        ProductAttributeEntity,
        ProductAttributeDto
      >(dto);

      const productAttribute = await this.productAttributeRepository.create(
        dtoToEntity,
      );

      productAttribute.product = await this.getProduct(dto.productID);

      const attributes: AttributeEntity[] = [];
      for (const attribute of dto.attributesID) {
        attributes.push(await this.getAttribute(attribute.id));
      }
      productAttribute.attributes = attributes;

      await this.productAttributeRepository.save(productAttribute);
      await this.processStockPurchase(productAttribute);

      return this.conversionService.toDto<
        ProductAttributeEntity,
        ProductAttributeDto
      >(productAttribute);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async processStockPurchase(productAttribute: ProductAttributeEntity): Promise<void> {
    try {
      const stockPurchase = new StockPurchaseEntity();
      stockPurchase.createAt = new Date();
      stockPurchase.updatedAt = new Date();
      stockPurchase.createdBy = productAttribute.createdBy;
      stockPurchase.updatedBy = productAttribute.updatedBy;
      stockPurchase.product = productAttribute.product;
      stockPurchase.productAttribute = productAttribute;
      stockPurchase.quantity = productAttribute.quantity;
      stockPurchase.purchasedPrice = productAttribute.purchasedPrice;
      await this.stockPurchaseRepository.save(stockPurchase);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async bulkCreate(
    dtos: CreateProductAttributeDto[],
  ): Promise<ProductAttributeDto[]> {
    try {
      const productAttributes: ProductAttributeDto[] = [];
      for (const dto of dtos) {
        productAttributes.push(await this.create(dto));
      }
      return productAttributes;
    } catch (error) {
      throw new SystemException(error);
    }
  }


  async update(
    id: string,
    dto: CreateProductAttributeDto,
  ): Promise<ProductAttributeDto> {
    try {
      const oldProductAttribute = await this.getProductAttribute(id);

      if (dto.productID)
        oldProductAttribute.product = await this.getProduct(dto.productID);

      if (dto.attributesID.length) {
        const attributes: AttributeEntity[] = [];
        for (const attribute of dto.attributesID) {
          attributes.push(await this.getAttribute(attribute.id));
        }
        oldProductAttribute.attributes = attributes;
      }

      const savedDto = { ...oldProductAttribute, ...dto };
      const productAttributeEntity = await this.conversionService.toEntity<
        ProductAttributeEntity,
        ProductAttributeDto
      >(savedDto);

      this.logger.error('updating:');
      this.logger.error(JSON.stringify(savedDto));
      const updatedProductAttribute =
        await this.productAttributeRepository.save(productAttributeEntity, {
          reload: true,
        });

      return this.conversionService.toDto<
        ProductAttributeEntity,
        ProductAttributeDto
      >(updatedProductAttribute);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getProductAttribute(id);

      const deleted = await this.productAttributeRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /*********************************** relations ******************************/

  getProductAttribute = async (id: string): Promise<ProductAttributeEntity> => {
    const productAttribute = await this.productAttributeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(
      productAttribute,
      'ProductAttribute not found!!',
    );
    return productAttribute;
  };

  getProduct = async (id: string): Promise<ProductEntity> => {
    const product = await this.productRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(product, 'Product Not Found!!');
    return product;
  };

  getAttribute = async (id: string): Promise<AttributeEntity> => {
    const attribute = await this.attributeRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(attribute, 'Attribute Not Found!!');
    return attribute;
  };
}
