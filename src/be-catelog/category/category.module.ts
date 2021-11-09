import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryEntity,
  ConversionService,
  ExceptionService,
  ProductEntity,
  RequestService,
  ResponseService,
} from '@simec/ecom-common';
import { EcomCacheModule } from '../../cache/ecom-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, ProductEntity]),
    EcomCacheModule,
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
  ],
})
export class CategoryModule {}
