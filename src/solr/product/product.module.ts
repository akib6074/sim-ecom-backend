import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { DtoUtil } from '../../be-search/util/dto.util';
import { SolrUtil } from '../../be-search/util/solr.util';
import {
  configEnvironment,
  configTypeorm,
  ConversionService,
  ProductEntity,
} from '@simec/ecom-common';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    HttpModule,
    configEnvironment(),
    configTypeorm(),
  ],
  providers: [ProductService, ConversionService, SolrUtil, DtoUtil],
})
export class ProductModule {}
