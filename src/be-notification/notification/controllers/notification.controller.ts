import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminGuard,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  NotificationDto,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { NotificationService } from '../services/notification.service';

@ApiTags('notification')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController
  implements GeneralController<NotificationDto>
{
  constructor(
    private notificationService: NotificationService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<ResponseDto> {
    const notification = this.notificationService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      notification,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('find')
  findOne(
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    notificationDto: NotificationDto,
  ): Promise<ResponseDto> {
    const notification = this.notificationService.findByObject(notificationDto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      notification,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('pagination')
  pagination(
    @Query('page', new IntValidationPipe()) page: number,
    @Query('limit', new IntValidationPipe()) limit: number,
    @Query('sort') sort: string,
    @Query('order') order: string,
  ): Promise<ResponseDto> {
    const notifications = this.notificationService.pagination(
      page,
      limit,
      sort,
      order,
    );
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      notifications,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    description: 'Notification successfully created!',
  })
  @ApiBody({ type: NotificationDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    notificationsDto: NotificationDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(notificationsDto);
    const notification = this.notificationService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Notification successfully created!',
      notification,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    description: 'Notification successfully updated!',
  })
  @ApiBody({ type: NotificationDto })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id', new UuidValidationPipe()) id: string,
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    notificationDto: NotificationDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(notificationDto);
    const notification = this.notificationService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Notification successfully updated!',
      notification,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Notification successfully deleted!',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.notificationService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Notification successfully deleted!',
      deleted,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const notification = this.notificationService.findById(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      notification,
    );
  }

  @EventPattern({
    service: 'notification',
    cmd: 'create',
    method: 'createNotification',
  })
  async createNotification(
    @Payload(new DtoValidationPipe()) notificationDto: NotificationDto,
  ) {
    await this.notificationService.create(notificationDto);
  }
}
