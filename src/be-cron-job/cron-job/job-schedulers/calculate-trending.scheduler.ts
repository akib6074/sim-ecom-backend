import { Cron, CronExpression } from '@nestjs/schedule';
import { ContactUsController } from 'src/be-core/contact-us/controllers/contact-us.controller';
import { CronJobService } from '../services/cron-job.service';

export class TrendingCalculationJobScheduler {

    constructor(private cronJobService: CronJobService) {}

    @Cron(CronExpression.EVERY_12_HOURS)
    caluculateProductTrending() {
        this.cronJobService.generateProductAndShopTrending();
    }
}
