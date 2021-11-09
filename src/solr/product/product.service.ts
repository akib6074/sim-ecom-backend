import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SolrUtil } from '../../be-search/util/solr.util';
import { core } from '../../be-search/enum/core.enum';
import {
  ConversionService,
  isActive,
  ProductDto,
  ProductEntity,
} from '@simec/ecom-common';

@Injectable()
export class ProductService {
  constructor(
    private readonly configService: ConfigService,
    private readonly conversionService: ConversionService,
    private readonly utilService: SolrUtil,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  rebase = async () => {
    await this.utilService.reindexProducts(core.PRODUCT, await this.products());
  };

  products = async (): Promise<ProductDto[]> => {
    const products = await this.productRepository.find({
      where: {
        ...isActive,
      },
      relations: ['category'],
    });
    return await this.conversionService.toDtos<ProductEntity, ProductDto>(
      products,
    );
  };
}
