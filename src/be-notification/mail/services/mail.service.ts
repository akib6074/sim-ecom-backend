import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailParserDto, SystemException } from '@simec/ecom-common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  mailTransporter = async (
    parsedMail: MailParserDto,
    isFromAdmin = false,
  ): Promise<boolean> => {
    try {
      let transporter = null;

      if (isFromAdmin) {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: this.configService.get('MAIL_ADMIN_USER'),
            pass: this.configService.get('MAIL_ADMIN_USER_PASSWORD'),
          },
        });
      } else {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: this.configService.get('MAIL_NO_REPLY_USER'),
            pass: this.configService.get('MAIL_NO_REPLY_USER_PASSWORD'),
          },
        });
      }

      await transporter.sendMail(parsedMail, (err, info) => {
        if (err) {
          this.logger.log(JSON.stringify(parsedMail));
          this.logger.log(err);
          throw new SystemException({
            message: 'Mail is not being sent!!',
          });
        } else {
          this.logger.log(info);
          return Promise.resolve(false);
        }
      });
      return Promise.resolve(false);
    } catch (error) {
      return Promise.resolve(false);
    }
  };
}
