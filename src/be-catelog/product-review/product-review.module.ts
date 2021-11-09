import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConversionService,
  ExceptionService, PermissionService, ProductEntity, ProductReviewEntity,
  RequestService,
  ResponseService, UserEntity
} from '@simec/ecom-common';
import { ProductReviewController } from './controllers/product-review.controller';
import { ProductReviewService } from './services/product-review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductReviewEntity, UserEntity, ProductEntity]),
  ],
  controllers: [ProductReviewController],
  providers: [
    ConversionService,
    ResponseService,
    ExceptionService,
    RequestService,
    PermissionService,
    ProductReviewService,
  ],
})
export class ProductReviewModule {}
