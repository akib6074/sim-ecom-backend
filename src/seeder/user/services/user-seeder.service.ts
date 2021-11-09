import { Injectable } from '@nestjs/common';
import { RoleService } from './role.service';
import { UserService } from './user.service';

@Injectable()
export class UserSeederService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  async initCore(): Promise<boolean> {
    await this.roleService.initRoles();
    await this.userService.initUsers();
    return true;
  }
}
