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
import {
  AdminGuard,
  CartDto,
  CreateCartDto,
  CustomerGuard,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
  TransMasterDto,
} from '@simec/ecom-common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransMasterService } from '../services/trans-master.service';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('carts')
export class TransMasterController {
  constructor(
      private transMasterService: TransMasterService,
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
    const transMasters = this.transMasterService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, transMasters);
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
          transMasterDto: TransMasterDto,
  ): Promise<ResponseDto> {
    const transMasters = this.transMasterService.findByObject(transMasterDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, transMasters);
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
    const transMasters = this.transMasterService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
        HttpStatus.OK,
        null,
        page,
        limit,
        transMasters,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/invoice/:id')
  findByOrder(
      @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const transMasters = this.transMasterService.findByInvoice(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, transMasters);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/user/:id')
  findByProduct(
      @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const transMasters = this.transMasterService.findByUser(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, transMasters);
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Transaction is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
      @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.transMasterService.remove(id);
    return this.responseService.toResponse(
        HttpStatus.OK,
        'Transaction Master is deleted successfully',
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
    const transMaster = this.transMasterService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, transMaster);
  }
}
