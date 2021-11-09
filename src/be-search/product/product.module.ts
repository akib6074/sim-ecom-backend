import { HttpModule, Module } from '@nestjs/common';
import { ResponseService } from '@simec/ecom-common';
import { DtoUtil } from '../util/dto.util';
import { SolrUtil } from '../util/solr.util';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [ProductService, SolrUtil, DtoUtil, ResponseService],
})
export class ProductModule {}
