import { HttpModule, Module } from '@nestjs/common';
import { ResponseService } from '@simec/ecom-common';
import { DtoUtil } from '../util/dto.util';
import { SolrUtil } from '../util/solr.util';
import { ShopController } from './controllers/shop.controller';
import { ShopService } from './services/shop.service';

@Module({
  imports: [HttpModule],
  controllers: [ShopController],
  providers: [ShopService, SolrUtil, DtoUtil, ResponseService],
})
export class ShopModule {}
