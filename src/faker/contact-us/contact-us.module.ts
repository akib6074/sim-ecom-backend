import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactUsFaker } from './contact-us.faker';
import {
  configEnvironment,
  configTypeorm,
  ContactUsEntity,
} from '@simec/ecom-common';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactUsEntity]),
    configEnvironment(),
    configTypeorm(),
  ],
  providers: [ContactUsFaker],
  exports: [ContactUsFaker],
})
export class ContactUsModule {}
