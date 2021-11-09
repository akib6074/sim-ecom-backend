import { HttpModule, Module } from '@nestjs/common';
import { OrderDetailsEntity, ProductEntity, RequestService, ResponseService, ShopEntity } from '@simec/ecom-common';
import { CronJobService } from './services/cron-job.service';
import { CronJobController } from './controllers/cron-job.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ 
    ScheduleModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([
      OrderDetailsEntity,
      ProductEntity,
      ShopEntity,
    ])
  ],
  providers: [ CronJobService, ResponseService],
  controllers: [ CronJobController ],
})
export class CronJobModule {}
