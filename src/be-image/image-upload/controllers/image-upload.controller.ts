import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Redis,
  RedisImageDto,
  PromotionImageDto,
  PromotionType,
} from '@simec/ecom-common';
import { RedisService } from 'nestjs-redis';
import { ImageUploadService } from '../services/image-upload.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiFile,
  bannerPath,
  categoryPath,
  imageFileFilter,
  pdfDocFilter, productBigPath,
  productCategoryPath,
  productSlidePath, productSmallPath,
  profilePath,
  shopCategoryPath,
  shopCoverPath, shopProfileBigPath, shopProfileSmallPath,
  shopSlidePath,
  storage,
  userProfilePath,
} from '../../utils/file-uploading.util';

@ApiTags('Image Upload')
@Controller('image-upload')
export class ImageUploadController {
  private readonly logger = new Logger('ImageUploadController');
  private readonly expireTime = this.configService.get('IMAGE_EXPIRE_TIME');

  constructor(
    private imageUploadService: ImageUploadService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('profile')
  async uploadedFileProfile(@Body() redisImageDto: RedisImageDto, @Res() res) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);

    return this.imageUploadService.gmCompression(
      file,
      profilePath,
      redisImageDto.filename,
      res,
      600,
      500,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/profile-redis')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileProfileRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('category')
  async uploadedFileCategory(@Body() redisImageDto: RedisImageDto, @Res() res) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);

    return this.imageUploadService.gmCompression(
      file,
      categoryPath,
      redisImageDto.filename,
      res,
      600,
      500,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('category-redis')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileCategoryRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('product')
  async uploadedFileProduct(@Body() redisImageDto: RedisImageDto, @Res() res) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);
    await this.imageUploadService.saveSmallVersionWithGmCompression(
        file,
        productSmallPath,
        redisImageDto.filename,
        300,
        250,
    );
    return this.imageUploadService.gmCompression(
      file,
      productBigPath,
      redisImageDto.filename,
      res,
      600,
      500,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('product-redis')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileProductRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('product/gallery')
  async uploadedFileProductGallery(
    @Body() redisImageDto: RedisImageDto,
    @Res() res,
  ) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);

    await this.imageUploadService.saveSmallVersionWithGmCompression(
        file,
        productSmallPath,
        redisImageDto.filename,
        300,
        250,
    );
    return this.imageUploadService.gmCompression(
        file,
        productBigPath,
        redisImageDto.filename,
        res,
        600,
        500,
    );

  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('/product-redis/gallery')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileProductGalleryRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('shop/profile')
  async uploadedFileShopProfile(
    @Body() redisImageDto: RedisImageDto,
    @Res() res,
  ) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);

    await this.imageUploadService.saveSmallVersionWithGmCompression(
        file,
        shopProfileSmallPath,
        redisImageDto.filename,
        300,
        250,
    );
    return this.imageUploadService.gmCompression(
      file,
      shopProfileBigPath,
      redisImageDto.filename,
      res,
      600,
      500,
    );
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('promotion/cover')
  async uploadedFilePromotionCover(
    @Body() promotionImageDto: PromotionImageDto,
    @Res() res,
  ) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(promotionImageDto.filename);

    this.logger.log(file);

    let image;
    switch (promotionImageDto.type) {
      case PromotionType.Banner: {
        image = this.imageUploadService.gmCompression(
          file,
          bannerPath,
          promotionImageDto.filename,
          res,
          800,
          215,
        );

        break;
      }
      case PromotionType.Product: {
        image = this.imageUploadService.gmCompression(
          file,
          productSlidePath,
          promotionImageDto.filename,
          res,
          600,
          500,
        );
        break;
      }
      case PromotionType.Shop: {
        image = this.imageUploadService.gmCompression(
          file,
          shopSlidePath,
          promotionImageDto.filename,
          res,
          600,
          500,
        );
        break;
      }
    }
    return image;
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('promotion-redis/cover')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFilePromotionCoverRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('user/profileimage')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async editUserProfileImage(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('user/save-profile-image')
  async uploadedUserProfileImage(
    @Body() redisImageDto: RedisImageDto,
    @Res() res,
  ) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    return this.imageUploadService.gmCompression(
      file,
      userProfilePath,
      redisImageDto.filename,
      res,
      200,
      200,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('shop-redis/profile')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileShopProfileRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('shop/cover')
  async uploadedFileShopCover(
    @Body() redisImageDto: RedisImageDto,
    @Res() res,
  ) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);

    return this.imageUploadService.gmCompression(
      file,
      shopCoverPath,
      redisImageDto.filename,
      res,
      600,
      500,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('shop-redis/cover')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileShopCoverRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('promotion-redis/banner')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFilePromotionBannerRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('promotion-redis/slide')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFilePromotionSlideRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('product/category')
  async uploadedFileProductCategory(
    @Body() redisImageDto: RedisImageDto,
    @Res() res,
  ) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);

    return this.imageUploadService.gmCompression(
      file,
      productCategoryPath,
      redisImageDto.filename,
      res,
      600,
      500,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('product/category-redis')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileProductCategoryRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('shop/category')
  async uploadedFileShopCategory(
    @Body() redisImageDto: RedisImageDto,
    @Res() res,
  ) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    this.logger.log(file);

    return this.imageUploadService.gmCompression(
      file,
      shopCategoryPath,
      redisImageDto.filename,
      res,
      600,
      500,
    );
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('shop/category-redis')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage,
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFileShopCategoryRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
    });
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('pdf')
  async uploadPdf(@Body() redisImageDto: RedisImageDto, @Res() res) {
    const file = await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .get(redisImageDto.filename);

    return this.imageUploadService.pdf(file, redisImageDto.filename, res);
  }

  @ApiConsumes('multipart/form-data')
  @ApiFile('file')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('pdf-redis')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
      fileFilter: pdfDocFilter,
    }),
  )
  async uploadPdfRedis(@UploadedFile() file, @Res() res) {
    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .set(file.filename, file.path);

    await this.redisService
      .getClient(Redis.REDIS_TMP_FILE)
      .expire(file.filename, this.expireTime);

    return res.status(HttpStatus.OK).json({
      filename: file.filename,
      path: file.path,
    });
  }
}
