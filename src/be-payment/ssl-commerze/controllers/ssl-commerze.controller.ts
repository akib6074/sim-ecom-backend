import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  RequestService,
  ResponseService,
  SslResponseDto,
  OnlinePaymentActivityLogDto,
  IntValidationPipe,
  ResponseDto,
} from '@simec/ecom-common';
import * as express from 'express';
import { SslCommerzeService } from '../services/ssl-commerze.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Payment Gateway')
@Controller('ssl-commerze')
export class SslCommerzeController {
  constructor(
    private sslCommerzeService: SslCommerzeService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
    private readonly configService: ConfigService,
  ) {}

  @Post('prepare')
  async prepare(@Body() postData: any): Promise<SslResponseDto> {
    const sslReplay = await this.sslCommerzeService.prepare(postData);
    console.log(sslReplay);

    return sslReplay;
  }

  @ApiOkResponse({
    status: HttpStatus.MOVED_PERMANENTLY,
    description: '',
  })
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  @Post('success/:id')
  async success(
    @Param('id') id: string,
    @Body() onlinePaymentActivityLogDto: OnlinePaymentActivityLogDto,
    @Res() res: express.Response,
  ) {
    onlinePaymentActivityLogDto = this.requestService.forCreate(onlinePaymentActivityLogDto);
    console.log('before🔥🔥🔥🔥🔥🔥🔥🔥🔥', onlinePaymentActivityLogDto);
    onlinePaymentActivityLogDto.online_payment_activity_log = JSON.stringify(onlinePaymentActivityLogDto);
    console.log('after🔥🔥🔥🔥🔥🔥🔥', onlinePaymentActivityLogDto);
    await this.sslCommerzeService.success(id, onlinePaymentActivityLogDto);
    await res.redirect(
      HttpStatus.MOVED_PERMANENTLY,
      this.configService.get('PAYMENT_REDIRECT_SUCCESS'),
    );
  }

  @ApiOkResponse({
    status: HttpStatus.MOVED_PERMANENTLY,
    description: '',
  })
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  @Post(['fail', 'cancel'])
  async failOrCancel(
    @Body() onlinePaymentActivityLogDto: OnlinePaymentActivityLogDto,
    @Res() res: express.Response,
  ) {
    onlinePaymentActivityLogDto = this.requestService.forCreate(onlinePaymentActivityLogDto);
    onlinePaymentActivityLogDto.online_payment_activity_log = JSON.stringify(onlinePaymentActivityLogDto);
    await this.sslCommerzeService.failOrCancel(onlinePaymentActivityLogDto);
    await res.redirect(
      HttpStatus.MOVED_PERMANENTLY,
      this.configService.get('PAYMENT_REDIRECT_CANCEL'),
    );
  }
}
