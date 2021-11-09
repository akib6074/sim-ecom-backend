import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryFaker } from './category.faker';
import {
  CategoryEntity,
  configEnvironment,
  configTypeorm,
} from '@simec/ecom-common';

const services = [CategoryFaker];

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
    configEnvironment(),
    configTypeorm(),
  ],
  providers: [...services],
  exports: [...services],
})
export class CategoryModule {}
