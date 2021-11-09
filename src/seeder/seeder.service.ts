import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreService } from './core/services/core.service';
import { UserSeederService } from './user/services/user-seeder.service';
import { UserEntity } from '@simec/ecom-common';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private readonly coreService: CoreService,
    private readonly userSeederService: UserSeederService,
  ) {}

  async initializeData() {
    this.logger.log('Initializing data ...');
    const userCount = await this.userRepository.count();
    if (userCount <= 0) {
      await this.coreService.initCore();
      await this.userSeederService.initCore();
    } else {
      this.logger.log('Seed is already run once');
    }
    return true;
  }
}
