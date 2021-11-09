import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  SystemException,
  NotificationDto,
  NotificationEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService implements GeneralService<NotificationDto> {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<NotificationDto[]> {
    try {
      const allNotifications = await this.notificationRepository.find({
        where: { ...isActive },
      });
      return this.conversionService.toDtos<NotificationEntity, NotificationDto>(
        allNotifications,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(
    notificationDto: NotificationDto,
  ): Promise<NotificationDto[]> {
    try {
      const allNotifications = await this.notificationRepository.find({
        where: {
          ...notificationDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<NotificationEntity, NotificationDto>(
        allNotifications,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[NotificationDto[], number]> {
    try {
      const allNotifications = await this.notificationRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<
        NotificationEntity,
        NotificationDto
      >(allNotifications);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: NotificationDto): Promise<NotificationDto> {
    try {
      const dtoToEntity = await this.conversionService.toEntity<
        NotificationEntity,
        NotificationDto
      >(dto);

      const notification = this.notificationRepository.create(dtoToEntity);
      await this.notificationRepository.save(notification);
      return this.conversionService.toDto<NotificationEntity, NotificationDto>(
        notification,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: NotificationDto): Promise<NotificationDto> {
    try {
      const saveDto = await this.getNotification(id);

      const dtoToEntity = await this.conversionService.toEntity<
        NotificationEntity,
        NotificationDto
      >({ ...saveDto, ...dto });

      const updatedNotification = await this.notificationRepository.save(
        dtoToEntity,
        {
          reload: true,
        },
      );
      return this.conversionService.toDto<NotificationEntity, NotificationDto>(
        updatedNotification,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getNotification(id);

      const deleted = await this.notificationRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<NotificationDto> {
    try {
      const notification = await this.getNotification(id);
      return this.conversionService.toDto<NotificationEntity, NotificationDto>(
        notification,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/

  async getNotification(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(notification, 'Notification Not Found!!');
    return notification;
  }
  /*********************** End checking relations of post *********************/
}
