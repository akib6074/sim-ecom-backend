import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DistrictEntity,
  isActive,
  Point,
  ThanaEntity,
  thanasObject,
} from '@simec/ecom-common';

@Injectable()
export class ThanaService {
  private readonly logger = new Logger(ThanaService.name);

  constructor(
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    @InjectRepository(ThanaEntity)
    private readonly thanaRepository: Repository<ThanaEntity>,
  ) {}

  createThanas = async (districtObject: any): Promise<ThanaEntity[]> => {
    const district = await this.districtRepository.findOne({
      name: districtObject.name,
      ...isActive,
    });
    const districtThanasObject = [];
    const thanas = [];
    try {
      for (const thanaObject of thanasObject) {
        if (thanaObject.district_id === districtObject.id) {
          districtThanasObject.push(thanaObject);
        }
      }

      for (const thanaObject of districtThanasObject) {
        const thanaEntity = this.generateThanaEntity(thanaObject);
        const thana = this.thanaRepository.create(thanaEntity);
        thana.district = district;
        await this.thanaRepository.save(thana);
        thanas.push(thana);
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
    return thanas;
  };

  generateThanaEntity = (thanaObject: any): ThanaEntity => {
    const thanaEntity = new ThanaEntity();
    thanaEntity.createAt = new Date();
    thanaEntity.updatedAt = new Date();
    thanaEntity.name = thanaObject.name;
    thanaEntity.location = new Point(0, 0);
    return thanaEntity;
  };
}
