import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { Point, ShopEntity } from '@simec/ecom-common';
import { CommonFakerService } from '../common-faker/common-faker.service';

@Injectable()
export class ShopFaker {
  rating = [1, 2, 3, 4, 5];

  constructor(
    @InjectRepository(ShopEntity)
    private shopRepository: Repository<ShopEntity>,
    private readonly commonFaker: CommonFakerService,
  ) {}

  init = async () => {
    const merchants = await this.commonFaker.getMerchants();
    const shopTypes = await this.commonFaker.getShopTypes();

    for (let x = 1; x <= 200; x++) {
      const shop = new ShopEntity();
      shop.name = faker.company.companyName() + '_' + x;
      shop.domain = faker.internet.domainName();
      shop.url = faker.internet.url();

      shop.location = faker.name.jobArea();
      shop.description = faker.commerce.productDescription();
      shop.rating = this.rating[Math.floor(Math.random() * this.rating.length)];

      shop.popular = 0;
      shop.trending = 0;

      shop.geoLocation = new Point(getX(), getY());

      shop.shopCoverImage = '/assets/images/shop-1620542959494.jpeg';
      shop.shopProfileImage = '/assets/images/shop-1620542959494.jpeg';

      shop.merchant = merchants[Math.floor(Math.random() * merchants.length)];
      shop.shopType = shopTypes[Math.floor(Math.random() * shopTypes.length)];

      shop.createAt = new Date();
      shop.updatedAt = new Date();

      const created = this.shopRepository.create(shop);
      await this.shopRepository.save(created);
    }
  };

  count = async () => {
    return this.shopRepository.count();
  };
}

function getX(): number {
  const precision = 100;
  return (
    20 +
    Math.floor(
      Math.random() * (5 * precision - 1 * precision) + 1 * precision,
    ) /
      (1 * precision)
  );
}

function getY(): number {
  const precision = 100;
  return (
    88 +
    Math.floor(
      Math.random() * (5 * precision - 1 * precision) + 1 * precision,
    ) /
      (1 * precision)
  );
}
