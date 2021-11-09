import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { CouponEntity, RequestService } from '@simec/ecom-common';
// import { RequestService } from '@simec/ecom-common';

@Injectable()
export class CouponFaker {
  constructor() {}

  init = async () => {
    for (let x = 1; x <= 1; x++) {
      const csEntity = new CouponEntity();
      console.log({ asdasd: 123123123123, csEntity });

      // const couponE = this.couponRepository.create(csEntity);
      // await this.couponRepository.save(couponE);
    }
  };

  count = async () => {
    return 0;
    // return await this.couponRepository.count();
  };
}
