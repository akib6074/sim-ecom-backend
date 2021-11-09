import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopTypeEntity, shopTypes } from '@simec/ecom-common';

@Injectable()
export class ShopTypeService {
  private readonly logger = new Logger(ShopTypeService.name);

  constructor(
    @InjectRepository(ShopTypeEntity)
    private readonly typeRepository: Repository<ShopTypeEntity>,
  ) {}

  initTypes = async (): Promise<void> => {
    try {
      for (const type of shopTypes) {
        const typeEntity = new ShopTypeEntity();
        typeEntity.name = type.name;
        typeEntity.image = '/assets/images/shop-1620542959494.jpeg';
        typeEntity.createAt = new Date();
        typeEntity.updatedAt = new Date();

        const created = await this.typeRepository.create(typeEntity);
        await this.typeRepository.save(created);
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
  };
}
