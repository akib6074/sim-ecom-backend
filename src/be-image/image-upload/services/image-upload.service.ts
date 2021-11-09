import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Redis } from '@simec/ecom-common';
import gm from 'gm';
import { RedisService } from 'nestjs-redis';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { pdfPath } from '../../utils/file-uploading.util';

@Injectable()
export class ImageUploadService {
  private readonly logger = new Logger(ImageUploadService.name);
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  gmCompression = async (
    file: string,
    filepath: string,
    filename: string,
    res,
    width = 110,
    height = 110,
  ) => {
    this.logger.log('file:' + file);
    this.logger.log(
      'dest:' +
        this.configService.get('IMAGE_DESTINATION') +
        '-' +
        filepath +
        filename,
    );
    const destinationDir = await this.generateFolder(filepath);

    gm.subClass({ imageMagick: true });
    gm(file)
      .strip()
      .blur(0.3)
      .quality(80)
      .resize(width, height, '!')
      .noProfile()
      .compress('LZMA')
      .write(destinationDir + filename, (err: Error) => {
        if (!err) {
          res.status(HttpStatus.CREATED).json({
            filename: filename,
          });
        } else {
          this.logger.log(err);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
        }
      });
  };

  saveSmallVersionWithGmCompression = async (
      file: string,
      filepath: string,
      filename: string,
      width = 110,
      height = 110,
  ) => {
    this.logger.log('file:' + file);
    this.logger.log(
        'dest:' +
        this.configService.get('IMAGE_DESTINATION') +
        '-' +
        filepath +
        filename,
    );
    const destinationDir = await this.generateFolder(filepath);

    gm.subClass({ imageMagick: true });
    gm(file)
        .strip()
        .blur(0.3)
        .quality(80)
        .resize(width, height, '!')
        .noProfile()
        .compress('LZMA')
        .write(destinationDir + filename, (err: Error) => {
          if (!err) {
            this.logger.log('small version is saved');
          } else {
            this.logger.log(err);
          }
        });
  };

  redisUpload = async (file) => {
    const uploadedFile = await this.redisService
      .getClient(Redis.REDIS_SESSION)
      .set('justForNowKey', file);
    this.logger.log('redis-set: ', uploadedFile);
  };

  getRedisFile = async () => {
    await this.redisService.getClient(Redis.REDIS_SESSION).get('justForNowKey');
  };

  generateFolder = async (filepath: string): Promise<string> => {
    const destination =
      this.configService.get('IMAGE_DESTINATION') + '-' + filepath;
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    return Promise.resolve(destination);
  };

  pdf = async (file: string, fileName: string, res) => {
    this.logger.log('file:' + file);

    const destinationDir = await this.generateFolder(pdfPath);

    this.logger.log('dest:' + destinationDir + fileName);

    gm(file).write(destinationDir + fileName, (err: Error) => {
      if (!err) {
        res.status(HttpStatus.CREATED).json({
          filename: fileName,
        });
      } else {
        this.logger.log(err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err });
      }
    });
  };
}
