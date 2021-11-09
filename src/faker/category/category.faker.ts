import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as faker from 'faker';
import { CategoryEntity } from '@simec/ecom-common';

@Injectable()
export class CategoryFaker {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  init = async () => {
    for (let x = 1; x <= 10; x++) {
      const category = new CategoryEntity();
      category.name = faker.name.jobType() + '_' + x;
      category.description = faker.lorem.paragraph();
      category.position = faker.random.number({
        min: 0,
        max: 100,
      });
      category.isRootCategory = 1;
      category.image = '/assets/images/shop-1620542959494.jpeg';
      category.createAt = new Date();
      category.updatedAt = new Date();

      const created = this.categoryRepository.create(category);
      await this.categoryRepository.save(created);
      if (!(x % 2)) {
        await this.createChild(created, x);
      }
    }
  };

  createChild = async (parentEntity: CategoryEntity, x: number) => {
    const category = new CategoryEntity();
    category.parent = parentEntity;

    category.name =
      faker.name.jobType() +
      '_' +
      x +
      '_' +
      faker.random.number({
        min: 0,
        max: 100,
      });

    category.description = faker.lorem.paragraph();
    category.position = faker.random.number({
      min: 0,
      max: 100,
    });

    category.isRootCategory = 0;
    category.image = `${faker.image.business()}?random=${Date.now()}`;

    category.createAt = new Date();
    category.updatedAt = new Date();

    const created = this.categoryRepository.create(category);
    await this.categoryRepository.save(created);
    return true;
  };

  findJobCategories = async (): Promise<CategoryEntity[]> => {
    return await this.categoryRepository.find();
  };

  count = async () => {
    return this.categoryRepository.count();
  };
}
