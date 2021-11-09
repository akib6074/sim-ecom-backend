import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsModule } from './contact-us/contact-us.module';
import { configEnvironment, configTypeorm } from '@simec/ecom-common';
import { FakerService } from './faker.service';
import { CategoryModule } from './category/category.module';
import { MerchantModule } from './merchant/merchant.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { PromotionModule } from './promotion/promotion.module';
import { CouponFakerModule } from './coupon/coupon-faker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    configEnvironment(),
    configTypeorm(),
    ContactUsModule,
    CategoryModule,
    MerchantModule,
    ShopModule,
    ProductModule,
    PromotionModule,
    CouponFakerModule,
  ],
  providers: [FakerService],
})
export class FakerModule {}
