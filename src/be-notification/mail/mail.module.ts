import { HttpModule, Module } from '@nestjs/common';
import { ResponseService } from '@simec/ecom-common';
import { MailController } from './controllers/mail.controller';
import { MailService } from './services/mail.service';

@Module({
  imports: [HttpModule],
  exports: [MailService],
  providers: [MailService, ResponseService],
  controllers: [MailController],
})
export class MailModule {}
