import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Logger,
} from '@nestjs/common';
import {
  DtoValidationPipe,
  ResponseDto,
  ResponseService,
  ProductDto,
} from '@simec/ecom-common';
import {
  EventPattern,
  Payload,
} from '@nestjs/microservices';
import { CronJobService } from '../services/cron-job.service';

@ApiTags('Cron Job')
@ApiBearerAuth()
@Controller('cron-job')
export class CronJobController {
  logger = new Logger(CronJobController.name);

  constructor(
    private cronJobService: CronJobService,
  ) {}

  @EventPattern({ service: 'cron-job', cmd: 'post', method: 'generateProductTrending' })
  async generateProductTrending(@Payload(new DtoValidationPipe()) productDto: ProductDto) {
    await this.cronJobService.generateProductAndShopTrending();
  }

  @Get()
  generateTrending(): any {
    this.cronJobService.generateProductAndShopTrending();
  }
}
