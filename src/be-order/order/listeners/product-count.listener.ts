import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderDetailsEntity, ProductEntity, ShopEntity } from '@simec/ecom-common';
import { ProductCountEvent } from '../events/product-count.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Between } from "typeorm";

@Injectable()
export class ProductCountListener {

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ShopEntity)
    private readonly shopRepository: Repository<ShopEntity>,
    @InjectRepository(OrderDetailsEntity)
    private readonly orderDetailesRepository: Repository<OrderDetailsEntity>) { }

  @OnEvent('count.popular')
  async handleCountProductsEvent(event: ProductCountEvent) {
    for (const orderDetail of event.orderDetails) {
      // count popular
      const product = await this.productRepository.findOne({ id: orderDetail.product.id }, {
        relations: ['shop']
      });
      // product popular
      product.popular = 0 + product.popular + orderDetail.quantity;
      // shop popural
      product.shop.popular += 1;

      await this.productRepository.save(product);
    }
  }
}
