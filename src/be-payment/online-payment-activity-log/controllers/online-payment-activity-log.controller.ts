import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AdminGuard,
  DtoValidationPipe,
  IntValidationPipe,
  OnlinePaymentActivityLogDto,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';

import { OnlinePaymentActivityLogService } from '../services/online-payment-activity-log.service';

@ApiTags('OnlinePaymentActivityLog')
@ApiBearerAuth()
@Controller('online-payment-activity-logs')
export class OnlinePaymentActivityLogController {
  constructor(
    private onlinePaymentActivityLogService: OnlinePaymentActivityLogService,
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
    const onlinePaymentActivityLogs =
      this.onlinePaymentActivityLogService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      onlinePaymentActivityLogs,
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
    onlinePaymentActivityLogDto: OnlinePaymentActivityLogDto,
  ): Promise<ResponseDto> {
    const onlinePaymentActivityLogs =
      this.onlinePaymentActivityLogService.findByObject(
        onlinePaymentActivityLogDto,
      );
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      onlinePaymentActivityLogs,
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
    const onlinePaymentActivityLogs =
      this.onlinePaymentActivityLogService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      onlinePaymentActivityLogs,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'OnlinePaymentActivityLog is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.onlinePaymentActivityLogService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'OnlinePaymentActivityLog is deleted successfully',
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
    const onlinePaymentActivityLog =
      this.onlinePaymentActivityLogService.findById(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      onlinePaymentActivityLog,
    );
  }
}
