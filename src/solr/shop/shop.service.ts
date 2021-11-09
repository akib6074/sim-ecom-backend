import { ConfigService } from '@nestjs/config';
import {
  ConversionService,
  isActive,
  ProductEntity,
  ShopDto,
  ShopEntity,
} from '@simec/ecom-common';
import { SolrUtil } from '../../be-search/util/solr.util';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { core } from '../../be-search/enum/core.enum';

@Injectable()
export class ShopService {
  constructor(
    private readonly configService: ConfigService,
    private readonly conversionService: ConversionService,
    private readonly utilService: SolrUtil,
    @InjectRepository(ShopEntity)
    private shopRepository: Repository<ShopEntity>,
  ) {}

  rebase = async () => {
    await this.utilService.reindexShops(core.SHOP, await this.shops());
  };

  shops = async (): Promise<ShopDto[]> => {
    const shops = await this.shopRepository.find({
      where: {
        ...isActive,
      },
      relations: ['shopType'],
    });
    return await this.conversionService.toDtos<ShopEntity, ShopDto>(shops);
  };
}
