import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  RequestService,
  RoleDto,
  RoleEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService implements GeneralService<RoleDto> {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private conversionService: ConversionService,
    private exceptionService: ExceptionService,
    private requestService: RequestService,
  ) {}

  findAll = async (): Promise<RoleDto[]> => {
    const roles = await this.roleRepository.find({ where: { ...isActive } });
    return this.conversionService.toDtos<RoleEntity, RoleDto>(roles);
  };

  findByObject = async (dto: RoleDto): Promise<RoleDto[]> => {
    const roles = await this.roleRepository.find({
      where: {
        ...dto,
        ...isActive,
      },
    });
    return this.conversionService.toDtos<RoleEntity, RoleDto>(roles);
  };

  create = async (dto: RoleDto): Promise<RoleDto> => {
    dto = this.requestService.forCreate(dto);

    const dtoToEntity = await this.conversionService.toEntity<
      RoleEntity,
      RoleDto
    >(dto);

    const role = await this.roleRepository.create(dtoToEntity);
    await this.roleRepository.save(role);

    return this.conversionService.toDto<RoleEntity, RoleDto>(role);
  };

  update = async (id: string, dto: RoleDto): Promise<RoleDto> => {
    const saveDto = await this.getRole(id);

    const dtoToEntity = await this.conversionService.toEntity<
      RoleEntity,
      RoleDto
    >({ ...saveDto, ...dto });

    const updatedRole = await this.roleRepository.save(dtoToEntity, {
      reload: true,
    });
    return this.conversionService.toDto<RoleEntity, RoleDto>(updatedRole);
  };

  remove = async (id: string): Promise<DeleteDto> => {
    const role = await this.getRole(id);

    const deleted = await this.roleRepository.delete({
      ...role,
      ...isInActive,
    });
    return Promise.resolve(new DeleteDto(!!deleted));
  };

  findById = async (id: string): Promise<RoleDto> => {
    const role = await this.getRole(id);
    return this.conversionService.toDto<RoleEntity, RoleDto>(role);
  };

  /****************** relations ***************/
  getRole = async (id: string): Promise<RoleEntity> => {
    const role = await this.roleRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(role, 'Role not found!');
    return role;
  };
}
