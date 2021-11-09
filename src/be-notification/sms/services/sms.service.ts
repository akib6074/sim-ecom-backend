import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOtpDto, SystemException } from '@simec/ecom-common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly _httpClient: HttpService,
  ) {}

  smsUniqueID = (): number => {
    const randomNUmber = Math.floor(Math.random() * 100);
    const dateNow = Date.now();
    return randomNUmber + dateNow;
  };

  smsTransporter = async (otpDto: CreateOtpDto) => {
    try {
      const otpUrl = `https://smsplus.sslwireless.com/api/v3/send-sms?api_token=Ebonear-4af13199-063f-44fe-a837-4258319dc3d8&sid=EBONEARNONAPI&sms=${
        'Ebonear : Your One time pin code is ' +
        otpDto.otp +
        ' It will expire in 5 minutes'
      }&msisdn=${otpDto.phone}&csms_id=${this.smsUniqueID()}`;

      await this._httpClient.get(otpUrl).subscribe((response) => {
        console.log(response);
        return Promise.resolve(true);
      });
      return Promise.resolve(false);
    } catch (error) {
      throw new SystemException(error);
    }
  };
}
