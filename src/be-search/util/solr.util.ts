import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import solr from 'solr-client';
import { ProductDto, ShopDto } from '@simec/ecom-common';
import { core } from '../enum/core.enum';
import { DtoUtil } from './dto.util';

@Injectable()
export class SolrUtil {
  private readonly logger = new Logger(SolrUtil.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly dtoUtlService: DtoUtil,
    private readonly httpService: HttpService,
  ) {}

  getSolrClient = (core: core): any => {
    const client = solr.createClient({
      host: this.configService.get('SOLR_SEARCH_APP_HOST'),
      port: this.configService.get('SOLR_SEARCH_APP_PORT'),
      core: core,
    });
    client.basicAuth('dev', 'SolrDev@2021');
    return client;
  };

  reindexProducts = (cr: core, products: ProductDto[]): Promise<any> => {
    const solrClient = this.getSolrClient(cr);
    return new Promise((resolve, reject) => {
      solrClient.deleteAll({}, async (err, res) => {
        if (err) {
          this.logger.log(err);
          reject(err);
        } else {
          // this.logger.log(res, cr + ' Delete All');
          solrClient.softCommit();

          for (const [index, product] of products.entries()) {
            await this.indexProduct(cr, product, index);
          }
          resolve(res);
        }
      });
    });
  };

  reindexShops = (cr: core, shops: ShopDto[]): Promise<any> => {
    const solrClient = this.getSolrClient(cr);
    return new Promise((resolve, reject) => {
      solrClient.deleteAll({}, async (err, res) => {
        if (err) {
          this.logger.log(err);
          reject(err);
        } else {
          // this.logger.log(res, cr + ' Delete All');
          solrClient.softCommit();

          for (const [index, shop] of shops.entries()) {
            await this.indexShop(cr, shop, index);
          }
          resolve(res);
        }
      });
    });
  };

  search = (core: core, q: string, page = 0, limit = 10): Promise<any> => {
    const start = page * limit;
    const solrClient = this.getSolrClient(core);
    const query = solrClient.createQuery().q(q).start(start).rows(limit);
    return new Promise((resolve, reject) => {
      solrClient.search(query, (err, res) => {
        if (err) {
          this.logger.log(err);
          reject(err);
        } else {
          // this.logger.log(res);
          resolve(res);
        }
      });
    });
  };

  searchShopsByLocation = (
    core: core,
    page = 0,
    limit = 10,
    lat = 24,
    lng = 89,
  ): Promise<any> => {
    const start = page * limit;
    const url = `http://dev:SolrDev@2021@localhost:8082/solr/shops/select?q=*%3A*&fq={!bbox%20d=500}&sfield=geo_location&pt=${lat},${lng}&sort=geodist()%20asc&start=${start}&rows=${limit}`;
    return this.httpService
      .get(url)
      .toPromise()
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
      });
  };

  searchProductsByLocation = (
    core: core,
    page = 0,
    limit = 10,
    lat = 24,
    lng = 89,
  ): Promise<any> => {
    const start = page * limit;
    const url = `http://dev:SolrDev@2021@localhost:8082/solr/products/select?q=*%3A*&fq={!bbox%20d=500}&sfield=geo_location&pt=${lat},${lng}&sort=geodist()%20asc&start=${start}&rows=${limit}`;
    return this.httpService
      .get(url)
      .toPromise()
      .then((res) => res.data)
      .catch((err) => {
        console.log(err);
      });
  };

  indexProduct = (
    cr: core,
    product: ProductDto,
    index: number = null,
  ): Promise<any> => {
    const solrClient = this.getSolrClient(cr);
    return new Promise((resolve, reject) => {
      solrClient.add(
        this.dtoUtlService.convertFromProductDto(product),
        (err, res) => {
          if (err) {
            this.logger.log(err);
            reject(err);
          } else {
            // this.logger.log(res, cr + ' Index: ' + index || '');
            solrClient.softCommit();
            resolve(res);
          }
        },
      );
    });
  };

  indexShop = (cr: core, shop: ShopDto, index: number = null): Promise<any> => {
    const solrClient = this.getSolrClient(cr);
    return new Promise((resolve, reject) => {
      solrClient.add(
        this.dtoUtlService.convertFromShopDto(shop),
        (err, res) => {
          if (err) {
            this.logger.log(err);
            reject(err);
          } else {
            // this.logger.log(res, cr + ' Index: ' + index || '');
            solrClient.softCommit();
            resolve(res);
          }
        },
      );
    });
  };

  remove = (cr: core, id: string): Promise<any> => {
    const solrClient = this.getSolrClient(cr);
    return new Promise((resolve, reject) => {
      solrClient.delete('id', id, (err, res) => {
        if (err) {
          this.logger.log(err);
          reject(err);
        } else {
          // this.logger.log(res);
          solrClient.softCommit();
          resolve(res);
        }
      });
    });
  };
}
