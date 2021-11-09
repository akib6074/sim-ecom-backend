import { Injectable } from '@nestjs/common';
import { ShopDto, SystemException } from '@simec/ecom-common';
import { core } from '../../enum/core.enum';
import { SolrUtil } from '../../util/solr.util';
import { DtoUtil } from '../../util/dto.util';

@Injectable()
export class ShopService {
  constructor(
    private readonly solrUtil: SolrUtil,
    private readonly dtoUtlService: DtoUtil,
  ) {}

  rebase = async (shops: ShopDto[]): Promise<any> => {
    return await this.solrUtil.reindexShops(core.SHOP, shops);
  };

  search = async (q: string, page: number, limit: number): Promise<any> => {
    try {
      const res = await this.solrUtil.search(core.SHOP, q, page, limit);
      return this.dtoUtlService.convertToShops(res);
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
      const res = await this.solrUtil.searchShopsByLocation(
        core.SHOP,
        page,
        limit,
        lat,
        lng,
      );
      return this.dtoUtlService.convertToShops(res);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  index = (dto: ShopDto): Promise<any> => {
    return this.solrUtil.indexShop(core.SHOP, dto);
  };

  remove = (id: string): Promise<any> => {
    return this.solrUtil.remove(core.SHOP, id);
  };
}
