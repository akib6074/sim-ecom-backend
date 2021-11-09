import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  isActive,
  isInActive,
  OnlinePaymentActivityLogDto,
  OnlinePaymentActivityLogEntity,
  SystemException,
  UserEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class OnlinePaymentActivityLogService {
  private readonly logger = new Logger(OnlinePaymentActivityLogService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OnlinePaymentActivityLogEntity)
    private readonly onlinePaymentActivityLogRepository: Repository<OnlinePaymentActivityLogEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<OnlinePaymentActivityLogDto[]> {
    try {
      const onlinePaymentActivityLogs =
        await this.onlinePaymentActivityLogRepository.find({ ...isActive });
      return this.conversionService.toDtos<
        OnlinePaymentActivityLogEntity,
        OnlinePaymentActivityLogDto
      >(onlinePaymentActivityLogs);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(
    onlinePaymentActivityLogDto: OnlinePaymentActivityLogDto,
  ): Promise<OnlinePaymentActivityLogDto[]> {
    try {
      const onlinePaymentActivityLogs =
        await this.onlinePaymentActivityLogRepository.find({
          where: {
            ...onlinePaymentActivityLogDto,
            ...isActive,
          },
        });
      return this.conversionService.toDtos<
        OnlinePaymentActivityLogEntity,
        OnlinePaymentActivityLogDto
      >(onlinePaymentActivityLogs);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[OnlinePaymentActivityLogDto[], number]> {
    try {
      const onlinePaymentActivityLogs =
        await this.onlinePaymentActivityLogRepository.findAndCount({
          where: { ...isActive },
          skip: (page - 1) * limit,
          take: limit,
          order: {
            [sort !== 'undefined' ? sort : 'updatedAt']:
              sort !== 'undefined' ? order : 'DESC',
          },
        });

      return this.conversionService.toPagination<
        OnlinePaymentActivityLogEntity,
        OnlinePaymentActivityLogDto
      >(onlinePaymentActivityLogs);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getOnlinePaymentActivityLog(id);
      const deleted = await this.onlinePaymentActivityLogRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<OnlinePaymentActivityLogDto> {
    try {
      const onlinePaymentActivityLog = await this.getOnlinePaymentActivityLog(
        id,
      );
      return this.conversionService.toDto<
        OnlinePaymentActivityLogEntity,
        OnlinePaymentActivityLogDto
      >(onlinePaymentActivityLog);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async getOnlinePaymentActivityLog(
    id: string,
  ): Promise<OnlinePaymentActivityLogEntity> {
    const onlinePaymentActivityLog =
      await this.onlinePaymentActivityLogRepository.findOne({
        where: {
          id,
          ...isActive,
        },
      });
    this.exceptionService.notFound(
      onlinePaymentActivityLog,
      'OnlinePaymentActivityLog Not Found!!',
    );
    return onlinePaymentActivityLog;
  }

  async getUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(user, 'User Not Found!!');
    return user;
  }
}
