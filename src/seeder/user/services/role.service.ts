import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity, rolesObject } from '@simec/ecom-common';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async initRoles(): Promise<boolean> {
    await this.createRoles();
    return true;
  }

  async createRoles(): Promise<boolean> {
    try {
      for (const roleObject of rolesObject) {
        const roleDto = await this.generateRoleEntity(roleObject);
        const role = this.roleRepository.create(roleDto);
        await this.roleRepository.save(role);
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error));
    }
    return true;
  }

  async generateRoleEntity(roleObject: any): Promise<RoleEntity> {
    const role = new RoleEntity();
    role.createAt = new Date();
    role.updatedAt = new Date();
    role.role = roleObject.role;
    role.description = roleObject.description;
    return role;
  }
}
