import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderDetailsEntity,
  ProductEntity,
  RequestService,
  ShopEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(OrderDetailsEntity)
    private readonly orderDetailsRepository: Repository<OrderDetailsEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
  ) {}

  generateProductAndShopTrending = async (): Promise<boolean> => {
    try {
      // get all the products of last 15 days
      const { today, last15thDay } = this.getDateInterval(15);
      const query = this.orderDetailsRepository
        .createQueryBuilder('order_details')
        .select('order_details.product', 'productId')
        .where(
          'DATE(order_details.created_at) BETWEEN  :last15thDay AND :today',
          { last15thDay, today },
        );
      const productIDs = await query.getRawMany();

      const productMap: Map<string, number> = new Map();
      const shopMap: Map<string, ShopEntity> = new Map();

      // loop through all the product IDs
      for (const productId of productIDs) {
        // filter out duplicate products
        if (!productMap.has(productId.productId)) {
          productMap.set(productId.productId, 0);

          const productWithShop = await this.productRepository.findOne(
            { id: productId.productId },
            { relations: ['shop'] },
          );

          // creating shop-product adjacency list
          const shop = productWithShop.shop;
          delete productWithShop.shop;
          const product = productWithShop;

          if (!shopMap.has(shop.id)) {
            shop['products'] = [];
            shopMap.set(shop.id, shop);
          }
          shopMap.get(shop.id).products.push(product);
        }

        // count product trending
        productMap.set(
          productId.productId,
          productMap.get(productId.productId) + 1,
        );
      }

      //update trending
      for (let [key, shopProduct] of shopMap) {
        let countShopTrending = 0;
        shopProduct.products.forEach(async (productData) => {
          productData.trending += productMap.get(productData.id);
          countShopTrending += productMap.get(productData.id);
          await this.productRepository.save(productData);
        });
        shopProduct.trending += countShopTrending;
        await this.shopRepository.save(shopMap.get(shopProduct.id));
      }

      return Promise.resolve(true);
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  getDateInterval = (interval: number) => {
    const today = new Date();
    const last15thDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - interval,
    );
    return {
      today: today.toISOString().split('T')[0],
      last15thDay: last15thDay.toISOString().split('T')[0],
    };
  };

  debug = (message) => {
    console.log('🔥🔥🔥 ', message);
  };
}
