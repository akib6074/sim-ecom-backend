import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { DtoValidationPipe, MailParserDto } from '@simec/ecom-common';

import { MailService } from '../services/mail.service';

@ApiTags('Mail Server')
@Controller('mail')
export class MailController {
  logger = new Logger(MailController.name);

  constructor(private mailService: MailService) {}

  @EventPattern({
    service: 'mail',
    cmd: 'post',
    method: 'sendNoReplyMailMessage',
  })
  async sendNoReplyMailMessage(
    @Payload(new DtoValidationPipe()) payloadMailParserDto: MailParserDto,
  ) {
    console.log('called norep');
    await this.mailService.mailTransporter(payloadMailParserDto, false);
  }
  @EventPattern({
    service: 'mail',
    cmd: 'post',
    method: 'sendAdminMailMessage',
  })
  async sendAdminMailMessage(
    @Payload(new DtoValidationPipe()) payloadMailParserDto: MailParserDto,
  ) {
    await this.mailService.mailTransporter(payloadMailParserDto, true);
  }
}
