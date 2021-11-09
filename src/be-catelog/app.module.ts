import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  AuthMiddleware,
  configEnvironment,
  configRedis,
  configTypeorm,
  PublicMiddleware,
} from '@simec/ecom-common';

import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { ShopModule } from './shop/shop.module';
import { AttributeModule } from './attribute/attribute.module';
import { AttributeGroupModule } from './attribute-group/attribute-group.module';
import { publicUrls } from './public.url';
import { ProductAttributeModule } from './product-attribute/product-attribute.module';
import { ShopTypeModule } from './shop-type/shop-type.module';
import { configEcomCacheModule } from '../cache/ecom-cache-module.config';
import { ShopReviewModule } from './shop-review/shop-review.module';
import { PromotionModule } from './promotion/promotion.module';
import { ProductReviewModule } from './product-review/product-review.module';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [
    configEnvironment(),
    configTypeorm(),
    configRedis(),
    configEcomCacheModule(),
    CategoryModule,
    ShopTypeModule,
    ShopModule,
    AttributeGroupModule,
    AttributeModule,
    ProductModule,
    ProductAttributeModule,
    ShopReviewModule,
    PromotionModule,
    ProductReviewModule,
    CouponModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PublicMiddleware).forRoutes('*');
    consumer
      .apply(AuthMiddleware)
      .exclude(...publicUrls)
      .forRoutes('*');
  }
}
