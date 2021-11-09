import { Module } from '@nestjs/common';
import { MerchantFaker } from './merchant.faker';
import { configEnvironment, configTypeorm } from '@simec/ecom-common';
import { UserSeederModule } from '../../seeder/user/user-seeder.module';
import { CommonFakerModule } from '../common-faker/common-faker.module';

const services = [MerchantFaker];

@Module({
  imports: [
    configEnvironment(),
    configTypeorm(),
    UserSeederModule,
    CommonFakerModule,
  ],
  providers: [...services],
  exports: [...services],
})
export class MerchantModule {}
