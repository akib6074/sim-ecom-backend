import { Module } from '@nestjs/common';
import { ImageUploadService } from './services/image-upload.service';
import { ImageUploadController } from './controllers/image-upload.controller';
import { configRedis } from '@simec/ecom-common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [configRedis()],
  providers: [ImageUploadService, ConfigService],
  controllers: [ImageUploadController],
})
export class ImageUploadModule {}
