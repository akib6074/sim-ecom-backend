import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CategoryEntity,
  isActive,
  ProductEntity,
  PromotionEntity,
  ShopEntity,
  ShopTypeEntity,
  UserEntity,
  PromotionType,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class PromotionFaker {
  constructor(
    @InjectRepository(PromotionEntity)
    private promotionRepository: Repository<PromotionEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ShopEntity)
    private shopRepository: Repository<ShopEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(ShopTypeEntity)
    private shopTypeRepository: Repository<ShopTypeEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  /******************* promotion *****************/

  init = async () => {
    const user = await this.userRepository.findOne({
      where: { ...isActive, email: 'merchant@simec.com' },
      relations: ['merchant'],
    });

    const merchant = user.merchant;

    const shop = await this.shopRepository.findOne({
      where: { ...isActive, merchant: merchant },
      relations: ['merchant'],
    });

    const catgories = await this.categoryRepository.find({
      where: { ...isActive },
    });

    const shopTypes = await this.shopTypeRepository.find({
      where: { ...isActive },
    });

    const product = await this.productRepository.findOne({
      where: { ...isActive, shop: shop },
      relations: ['shop'],
    });

    const promotion = new PromotionEntity();
    promotion.createAt = new Date();
    promotion.updatedAt = new Date();
    promotion.title = 'DECORATE YOUR DIGITAL BUSINESS WITH US';
    promotion.description =
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the indutry's standard dummy text ever scince the 1500s";
    promotion.isActive = isActive.isActive;
    promotion.startDate = new Date();
    promotion.endDate = new Date(new Date().setDate(new Date().getDate() + 7));
    promotion.promotionCoverImage = '/assets/images/slider2.png';
    promotion.type = PromotionType.Banner;
    promotion.titleColor = '#000';
    promotion.descriptionColor = '#000';
    promotion.shop = shop;
    promotion.product = product;
    promotion.user = user;
    await this.promotionRepository.save(promotion);

    for (const shopType of shopTypes) {
      delete promotion.id;
      promotion.shopType = shopType;
      promotion.type = PromotionType.Shop;
      promotion.promotionCoverImage = '/assets/images/category-slider1.png';
      await this.promotionRepository.save(promotion);

      delete promotion.id;
      promotion.shopType = shopType;
      promotion.type = PromotionType.Shop;
      promotion.promotionCoverImage = '/assets/images/category-slider2.png';
      await this.promotionRepository.save(promotion);
    }

    for (const category of catgories) {
      delete promotion.id;
      delete promotion.shopType;
      promotion.category = category;
      promotion.type = PromotionType.Product;
      promotion.promotionCoverImage = '/assets/images/category-slider1.png';
      await this.promotionRepository.save(promotion);

      delete promotion.id;
      delete promotion.shopType;
      promotion.category = category;
      promotion.type = PromotionType.Product;
      promotion.promotionCoverImage = '/assets/images/category-slider2.png';
      await this.promotionRepository.save(promotion);
    }
  };

  count = async () => {
    return this.promotionRepository.count();
  };
}
