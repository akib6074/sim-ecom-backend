import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
import { CoreService } from './core/services/core.service';
import { UserSeederService } from './user/services/user-seeder.service';
import { UserSeederModule } from './user/user-seeder.module';
import {
  configEnvironment,
  configTypeorm,
  UserEntity,
} from '@simec/ecom-common';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    configEnvironment(),
    configTypeorm(),
    CoreModule,
    UserSeederModule,
  ],
  providers: [SeederService, UserSeederService, CoreService],
})
export class SeederModule {}
