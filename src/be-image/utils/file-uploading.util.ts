import { ApiBody } from '@nestjs/swagger';
import * as multer from 'multer';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { SystemException } from '@simec/ecom-common';

const configService = new ConfigService();

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|JPG|JPEG|png|PNG|gif|GIF)$/)) {
    return callback(
      new SystemException({ message: 'Only image files are allowed!' }),
      false,
    );
  }
  callback(null, true);
};

export const pdfDocFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(pdf|PDF|doc|DOC|docx|DOCX)$/)) {
    return callback(
      new SystemException({ message: 'Only pdf or doc files are allowed!' }),
      false,
    );
  }
  callback(null, true);
};

export const editedFileName = (req, file, callback) => {
  let name = file.originalname.split('.')[0];
  name = name.replace(/\s/g, '');
  const fileExtName = extname(file.originalname);
  const randomName = new Date().getTime();
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const storage = multer.diskStorage({
  destination: configService.get('IMAGE_DESTINATION') + '-temp/',
  filename: editedFileName,
});

export const ApiFile =
  (fileName = 'image'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })(target, propertyKey, descriptor);
  };

export const ApiMultiFile =
  (fileName = 'image'): MethodDecorator =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      type: 'multipart/form-data',
      required: true,
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    })(target, propertyKey, descriptor);
  };

export const profilePath = 'profile/';
export const userProfilePath = 'user/profile/';
export const productBigPath = 'product/d600/';
export const productSmallPath = 'product/d300/';
export const productCategoryPath = 'product/category/';
export const bannerPath = 'banner/';
export const shopSlidePath = 'shop/slide/';
export const productSlidePath = 'product/slide/';
export const shopProfileBigPath = 'shop/d600/';
export const shopProfileSmallPath = 'shop/d300/';
export const shopCoverPath = 'shop/cover/';
export const shopCategoryPath = 'shop/category/';
export const categoryPath = 'category/';
export const pdfPath = 'pdf/';
