import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThanaService } from './thana.service';
import { DistrictEntity, districtsObject, Point } from '@simec/ecom-common';

@Injectable()
export class DistrictService {
  private readonly logger = new Logger(DistrictService.name);
  constructor(
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    private readonly thanaService: ThanaService,
  ) {}

  createDistricts = async (divisionObject: any): Promise<DistrictEntity[]> => {
    const districts = [];
    const divisionDistrictsObject = [];
    try {
      for (const districtObject of districtsObject) {
        if (districtObject.division_id === divisionObject.id) {
          divisionDistrictsObject.push(districtObject);
        }
      }
      for (const districtObject of divisionDistrictsObject) {
        const districtEntity = this.generateDistrictEntity(districtObject);
        const district = this.districtRepository.create(districtEntity);
        district.thanas = await this.thanaService.createThanas(districtObject);
        await this.districtRepository.save(district);
        districts.push(district);
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
    return districts;
  };

  generateDistrictEntity = (districtObject: any): DistrictEntity => {
    const districtEntity = new DistrictEntity();
    districtEntity.createAt = new Date();
    districtEntity.updatedAt = new Date();
    districtEntity.name = districtObject.name;
    districtEntity.location = new Point(
      districtObject.lat,
      districtObject.long,
    );
    districtEntity.shippingCost = 40.00;
    return districtEntity;
  };
}
