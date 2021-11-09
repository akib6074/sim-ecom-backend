import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import {
  AttributeEntity,
  AttributeGroupEntity,
  Bool,
  ProductAttributeEntity,
  ProductEntity,
  StockPurchaseEntity,
} from '@simec/ecom-common';
import { CommonFakerService } from '../common-faker/common-faker.service';

@Injectable()
export class ProductFaker {
  constructor(
    @InjectRepository(AttributeGroupEntity)
    private attrGrpRepository: Repository<AttributeGroupEntity>,
    @InjectRepository(AttributeEntity)
    private attrRepository: Repository<AttributeEntity>,
    @InjectRepository(ProductAttributeEntity)
    private productAttrRepository: Repository<ProductAttributeEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(StockPurchaseEntity)
    private stockPurchaseRepository: Repository<StockPurchaseEntity>,
    private readonly commonService: CommonFakerService,
  ) {}

  colorGrp: AttributeGroupEntity = null;
  sizeGrp: AttributeGroupEntity = null;

  colorAttrs: AttributeEntity[] = [];
  sizeAttrs: AttributeEntity[] = [];

  sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];

  prices = [10.5, 15.5, 20.5, 25.5, 30.5, 60.0, 70.0, 80.0, 90.0, 100.0];
  rating = [1, 2, 3, 4, 5];
  quantity = [4, 6, 10, 12, 20];

  /******************* attribute group ************************/
  attributeGroup = async () => {
    await this.sizeGroup();
    await this.colorGroup();
  };

  colorGroup = async () => {
    const grp = new AttributeGroupEntity();
    grp.isColorGroup = Bool.Yes;
    grp.name = 'Color';
    grp.description = faker.commerce.productAdjective();
    grp.position = 1;

    grp.createAt = new Date();
    grp.updatedAt = new Date();

    const create = await this.attrGrpRepository.create(grp);
    this.colorGrp = await this.attrGrpRepository.save(create);
  };

  sizeGroup = async () => {
    const grp = new AttributeGroupEntity();
    grp.isColorGroup = Bool.No;
    grp.name = 'Size';
    grp.description = faker.commerce.productAdjective();
    grp.position = 1;

    grp.createAt = new Date();
    grp.updatedAt = new Date();

    const create = await this.attrGrpRepository.create(grp);
    this.sizeGrp = await this.attrGrpRepository.save(create);
  };

  /******************* attribute ************************/

  attributes = async () => {
    await this.colorAttributes();
    await this.sizeAttributes();
  };

  colorAttributes = async () => {
    for (let x = 1; x <= 5; x++) {
      const attr = new AttributeEntity();
      attr.name = faker.commerce.color();
      attr.color = faker.commerce.color();
      attr.description = faker.lorem.sentence();
      attr.position = x;
      attr.attributeGroup = this.colorGrp;

      attr.createAt = new Date();
      attr.updatedAt = new Date();

      const create = await this.attrRepository.create(attr);
      this.colorAttrs.push(await this.attrRepository.save(create));
    }
  };

  sizeAttributes = async () => {
    for (let x = 0; x < this.sizes.length; x++) {
      const attr = new AttributeEntity();
      attr.name = this.sizes[x];
      attr.color = '';
      attr.description = faker.lorem.sentence();
      attr.position = x;
      attr.attributeGroup = this.sizeGrp;

      attr.createAt = new Date();
      attr.updatedAt = new Date();

      const create = await this.attrRepository.create(attr);
      this.colorAttrs.push(await this.attrRepository.save(create));
    }
  };

  /******************* product *****************/

  init = async () => {
    await this.attributeGroup();
    await this.attributes();

    const shops = await this.commonService.getShops();
    const users = await this.commonService.getUsers();
    const categories = await this.commonService.getCategories();

    for (let x = 1; x <= 2000; x++) {
      const pr = new ProductEntity();

      pr.name = faker.commerce.productName();
      pr.summary = faker.lorem.sentence();
      pr.description = faker.commerce.productDescription();
      pr.metaDescription = faker.lorem.paragraph();
      pr.metaKeywords = faker.lorem.slug();
      pr.metaTitle = faker.commerce.productName();
      pr.reference = faker.phone.phoneNumber();
      pr.quantity = this.quantity[Math.floor(Math.random() * this.quantity.length)];
      pr.reserved = 0;
      pr.sold = 0;

      pr.price = this.prices[Math.floor(Math.random() * this.prices.length)];
      pr.purchasedPrice = pr.price - 5;
      pr.rating = this.rating[Math.floor(Math.random() * this.rating.length)];

      pr.popular = 0;
      pr.trending = 0;

      pr.discount = x % 5 === 0 ? 0 : 10;
      pr.wholesalePrice = pr.price - (x % 5 === 0 ? 10 : 5);

      pr.additionalShippingCost = x % 5 === 0 ? 5 : 10;
      pr.lowStockThreshold = 3;

      pr.onSale = x % 2 === 0 ? Bool.Yes : Bool.No;
      pr.isVirtual = x % 2 === 0 ? Bool.Yes : Bool.No;
      pr.isPack = x % 2 === 0 ? Bool.Yes : Bool.No;

      pr.image = {
        cover: '/assets/images/product-1620542949771.jpeg',
        gallery: [
          `${faker.random.image()}?random=${Date.now()}`,
          `${faker.image.abstract()}?random=${Date.now()}`,
          `${faker.image.food()}?random=${Date.now()}`,
          `${faker.image.transport()}?random=${Date.now()}`,
        ],
      };

      pr.shop = shops[Math.floor(Math.random() * shops.length)];
      pr.location = pr.shop.location;
      pr.geoLocation = pr.shop.geoLocation;
      pr.user = users[Math.floor(Math.random() * users.length)];
      pr.category = categories[Math.floor(Math.random() * categories.length)];

      pr.createAt = new Date();
      pr.updatedAt = new Date();

      const create = await this.productRepository.create(pr);
      await this.productRepository.save(create);
      await this.productAttribute(create);
    }
  };

  productAttribute = async (product: ProductEntity) => {
    for (let x = 0; x < 2; x++) {
      const proAttr = new ProductAttributeEntity();
      proAttr.reference = product.reference;
      proAttr.price = product.price;
      proAttr.purchasedPrice = product.price - 5;
      proAttr.discount = product.discount;
      proAttr.quantity = product.quantity / 2;
      proAttr.wholesalePrice = product.wholesalePrice;
      proAttr.product = product;
      proAttr.additionalShippingCost = product.additionalShippingCost;

      proAttr.image = product.image.gallery[0];

      proAttr.attributes = [
        ...this.colorAttrs.sort(() => 0.5 - Math.random()).slice(0, 2),

        ...this.sizeAttrs.sort(() => 0.5 - Math.random()).slice(0, 2),
      ];

      proAttr.createAt = new Date();
      proAttr.updatedAt = new Date();

      const productAttribute = await this.productAttrRepository.create(proAttr);
      await this.productAttrRepository.save(productAttribute);

      let stockPurchase = new StockPurchaseEntity();
      stockPurchase.createAt = new Date();
      stockPurchase.updatedAt = new Date();
      stockPurchase.productAttribute = productAttribute;
      stockPurchase.product = product;
      stockPurchase.purchasedPrice = productAttribute.purchasedPrice;
      stockPurchase.quantity = productAttribute.quantity;
      stockPurchase = await this.stockPurchaseRepository.create(stockPurchase);
      await this.stockPurchaseRepository.save(stockPurchase);
    }
  };

  count = async () => {
    return this.productRepository.count();
  };
}
