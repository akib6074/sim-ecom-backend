import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateOtpDto,
  DtoValidationPipe,
  ResponseService,
} from '@simec/ecom-common';

import { SmsService } from '../services/sms.service';

@ApiTags('SMS Server')
@Controller('sms')
export class SmsController {
  logger = new Logger(SmsController.name);

  constructor(
    private smsService: SmsService,
    private readonly responseService: ResponseService,
  ) {}

  @EventPattern({ service: 'sms', cmd: 'post', method: 'sendSMS' })
  async sendSMS(@Payload(new DtoValidationPipe()) createOtpDto: CreateOtpDto) {
    await this.smsService.smsTransporter(createOtpDto);
  }
}
