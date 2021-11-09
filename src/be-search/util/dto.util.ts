import { Injectable } from '@nestjs/common';
import {
  CategoryDto,
  ProductDto,
  ShopDto,
  ShopTypeDto,
} from '@simec/ecom-common';

@Injectable()
export class DtoUtil {
  convertToProducts = (res: any): Promise<[ProductDto[], number]> => {
    const products = [];
    for (const product of res['response']['docs']) {
      products.push(this.toProductPostDto(product));
    }
    console.log(products);
    return Promise.resolve([products, res['response']['numFound']]);
  };

  convertToShops = (res: any): Promise<[ShopDto[], number]> => {
    const shops = [];
    for (const shop of res['response']['docs']) {
      shops.push(this.toShopPostDto(shop));
    }
    return Promise.resolve([shops, res['response']['numFound']]);
  };

  convertFromProductDto = (product: ProductDto): any => {
    const createProperty: any = {};
    createProperty.id = product.id;
    createProperty.updated_at = product.updatedAt;
    createProperty.product_name = product.name;
    createProperty.meta_title = product.metaTitle;
    createProperty.image = product.image.cover;
    createProperty.summary = product.summary;
    createProperty.description = product.description;
    createProperty.reference = product.reference;
    createProperty.price = product.price;
    createProperty.rating = product.rating;
    createProperty.popular = product.popular;
    createProperty.trending = product.trending;
    createProperty.product_location = product.location;
    createProperty.geo_location = `${product.geoLocation.x},${product.geoLocation.y}`;
    createProperty.on_sale = product.onSale;
    createProperty.is_pack = product.isPack;
    createProperty.is_virtual = product.isVirtual;
    createProperty.category_id = product.category.id;
    createProperty.category_name = product.category.name;

    return createProperty;
  };

  toProductPostDto = (product: any): ProductDto => {
    const propertyPostDto = new ProductDto();
    const geoLocation = product.geo_location?.split(',');
    propertyPostDto.category = new CategoryDto();
    propertyPostDto.image = { cover: product.image, gallery: [] };
    propertyPostDto.id = product.id;
    propertyPostDto.updatedAt = product.updated_at;
    propertyPostDto.name = product.product_name;
    propertyPostDto.metaTitle = product.meta_title;
    propertyPostDto.summary = product.summary;
    propertyPostDto.description = product.description;
    propertyPostDto.reference = product.reference;
    propertyPostDto.price = product.price;
    propertyPostDto.rating = product.rating;
    propertyPostDto.popular = product.popular;
    propertyPostDto.trending = product.trending;
    propertyPostDto.location = product.product_location;
    if (geoLocation?.length) {
      propertyPostDto.geoLocation = { x: geoLocation[0], y: geoLocation[1] };
    }
    propertyPostDto.onSale = product.on_sale;
    propertyPostDto.isPack = product.is_pack;
    propertyPostDto.isVirtual = product.is_virtual;
    propertyPostDto.category.id = product.category_id;
    propertyPostDto.category.name = product.category_name;
    return propertyPostDto;
  };

  convertFromShopDto = (shop: ShopDto): any => {
    const createProperty: any = {};
    createProperty.id = shop.id;
    createProperty.updated_at = shop.updatedAt;
    createProperty.shop_cover_image = shop.shopCoverImage;
    createProperty.shop_profile_image = shop.shopProfileImage;
    createProperty.shop_domain = shop.domain;
    createProperty.rating = shop.rating;
    createProperty.popular = shop.popular;
    createProperty.trending = shop.trending;
    createProperty.shop_name = shop.name;
    createProperty.shop_type_id = shop.shopType?.id;
    createProperty.shop_type_name = shop.shopType?.name;
    createProperty.shop_location = shop.location;
    createProperty.geo_location = `${shop.geoLocation.x},${shop.geoLocation.y}`;
    return createProperty;
  };

  toShopPostDto = (shop: any): ShopDto => {
    const shopPostDto = new ShopDto();
    shopPostDto.shopType = new ShopTypeDto();
    const geoLocation = shop.geo_location?.split(',');
    shopPostDto.id = shop.id;
    shopPostDto.updatedAt = shop.updated_at;
    shopPostDto.shopCoverImage = shop.shop_cover_image;
    shopPostDto.shopProfileImage = shop.shop_profile_image;
    shopPostDto.domain = shop.shop_domain;
    shopPostDto.rating = shop.rating;
    shopPostDto.popular = shop.popular;
    shopPostDto.trending = shop.trending;
    shopPostDto.name = shop.shop_name;
    shopPostDto.shopType.id = shop.shop_type_id;
    shopPostDto.shopType.name = shop.shop_type_name;
    shopPostDto.location = shop.shop_location;
    if (geoLocation?.length) {
      shopPostDto.geoLocation = { x: geoLocation[0], y: geoLocation[1] };
    }
    return shopPostDto;
  };
}
