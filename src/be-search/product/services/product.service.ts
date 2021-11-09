import { Injectable } from '@nestjs/common';
import { ProductDto, SystemException } from '@simec/ecom-common';
import { core } from '../../enum/core.enum';
import { SolrUtil } from '../../util/solr.util';
import { DtoUtil } from '../../util/dto.util';

@Injectable()
export class ProductService {
  constructor(
    private readonly solrUtil: SolrUtil,
    private readonly dtoUtlService: DtoUtil,
  ) {}

  rebase = async (product: ProductDto[]): Promise<any> => {
    return await this.solrUtil.reindexProducts(core.PRODUCT, product);
  };

  search = async (q: string, page: number, limit: number): Promise<any> => {
    try {
      const res = await this.solrUtil.search(core.PRODUCT, q, page, limit);
      return this.dtoUtlService.convertToProducts(res);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  searchByLocation = async (
    page: number,
    limit: number,
    lat: number,
    lng: number,
  ): Promise<any> => {
    try {
      const res = await this.solrUtil.searchProductsByLocation(
        core.PRODUCT,
        page,
        limit,
        lat,
        lng,
      );
      console.log(res);
      return this.dtoUtlService.convertToProducts(res);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  index = (dto: ProductDto): Promise<any> => {
    return this.solrUtil.indexProduct(core.PRODUCT, dto);
  };

  remove = (id: string): Promise<any> => {
    return this.solrUtil.remove(core.PRODUCT, id);
  };
}
