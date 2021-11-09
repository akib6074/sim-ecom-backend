import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  // CategoryRestrictionEntity,
  configEnvironment,
  configTypeorm,
  CouponEntity,
  CouponUsageEntity,
  // CustomerRestrictionEntity,
  // ProductRestrictionEntity,
  // ShopRestrictionEntity,
} from '@simec/ecom-common';
import { CouponFaker } from './coupon.faker';

const services = [CouponFaker];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CouponUsageEntity,
      // CouponRuleEntity,
      // CategoryRestrictionEntity,
      // CustomerRestrictionEntity,
      // ProductRestrictionEntity,
      // ShopRestrictionEntity,
    ]),
    configEnvironment(),
    configTypeorm(),
  ],
  providers: services,
  exports: services,
})
export class CouponFakerModule {}
