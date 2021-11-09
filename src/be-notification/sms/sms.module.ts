import { HttpModule, Module } from '@nestjs/common';
import { ResponseService } from '@simec/ecom-common';
import { SmsService } from './services/sms.service';
import { SmsController } from "./controllers/sms.controller";

@Module({
  imports: [HttpModule],
  exports: [SmsService],
  providers: [SmsService, ResponseService],
  controllers: [SmsController],
})
export class SmsModule {}
