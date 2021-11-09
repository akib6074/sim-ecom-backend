import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  ProfileDto,
  ProfileEntity,
  RequestService,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService implements GeneralService<ProfileDto> {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    private conversionService: ConversionService,
    private exceptionService: ExceptionService,
    private requestService: RequestService,
  ) {}

  findAll = async (): Promise<ProfileDto[]> => {
    const profiles = await this.profileRepository.find({
      where: { ...isActive },
    });
    return this.conversionService.toDtos<ProfileEntity, ProfileDto>(profiles);
  };

  findByObject = async (dto: ProfileDto): Promise<ProfileDto[]> => {
    const profiles = await this.profileRepository.find({
      where: {
        ...dto,
        ...isActive,
      },
    });
    return this.conversionService.toDtos<ProfileEntity, ProfileDto>(profiles);
  };

  create = async (dto: ProfileDto): Promise<ProfileDto> => {
    dto = this.requestService.forCreate(dto);

    const dtoToEntity = await this.conversionService.toEntity<
      ProfileEntity,
      ProfileDto
    >(dto);

    const profile = await this.profileRepository.create(dtoToEntity);
    await this.profileRepository.save(profile);

    return this.conversionService.toDto<ProfileEntity, ProfileDto>(profile);
  };

  update = async (id: string, dto: ProfileDto): Promise<ProfileDto> => {
    const profile = await this.getProfile(id);

    const dtoToEntity = await this.conversionService.toEntity<
      ProfileEntity,
      ProfileDto
    >({ ...profile, ...dto });

    const updatedProfile = await this.profileRepository.save(dtoToEntity, {
      reload: true,
    });

    return this.conversionService.toDto<ProfileEntity, ProfileDto>(
      updatedProfile,
    );
  };

  remove = async (id: string): Promise<DeleteDto> => {
    const saveDto = await this.getProfile(id);

    const deleted = await this.profileRepository.save({
      ...saveDto,
      ...isInActive,
    });
    return Promise.resolve(new DeleteDto(!!deleted));
  };

  findById = async (id: string): Promise<ProfileDto> => {
    const profile = await this.getProfile(id);
    return this.conversionService.toDto<ProfileEntity, ProfileDto>(profile);
  };

  /******************** relations ***********************/
  getProfile = async (id: string): Promise<ProfileEntity> => {
    const profile = await this.profileRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(profile, 'Profile not found!');
    return profile;
  };
}
