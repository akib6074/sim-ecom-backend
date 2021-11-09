import { Injectable } from '@nestjs/common';
import { UserService } from '../../seeder/user/services/user.service';
import { merchantUsersObject } from './merchant-user.json';
import { CommonFakerService } from '../common-faker/common-faker.service';

@Injectable()
export class MerchantFaker {
  constructor(
    private readonly userService: UserService,
    private readonly commonService: CommonFakerService,
  ) {}

  init = async () => {
    await this.userService.createUsers(merchantUsersObject);
  };

  count = async (): Promise<number> => {
    return (await this.commonService.getMerchants()).length;
  };
}
