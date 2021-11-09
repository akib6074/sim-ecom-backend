import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  configEnvironment,
  configTypeorm,
  ConversionService,
  ShopEntity,
} from '@simec/ecom-common';
import { ShopService } from './shop.service';
import { SolrUtil } from '../../be-search/util/solr.util';
import { DtoUtil } from '../../be-search/util/dto.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopEntity]),
    HttpModule,
    configEnvironment(),
    configTypeorm(),
  ],
  providers: [ShopService, ConversionService, SolrUtil, DtoUtil],
})
export class ShopModule {}
