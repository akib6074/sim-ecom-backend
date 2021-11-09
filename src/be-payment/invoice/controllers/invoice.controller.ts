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
  InvoiceDto,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';

import { InvoiceService } from '../services/invoice.service';

@ApiTags('Invoice')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(
    private invoiceService: InvoiceService,
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
    const invoices = this.invoiceService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, invoices);
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
    invoiceDto: InvoiceDto,
  ): Promise<ResponseDto> {
    const invoices = this.invoiceService.findByObject(invoiceDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, invoices);
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
    const invoices = this.invoiceService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      invoices,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/order/:id')
  findByOrder(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const invoices = this.invoiceService.findByOrder(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, invoices);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/user/:id')
  findByUser(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const invoices = this.invoiceService.findByUser(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, invoices);
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Invoice is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.invoiceService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Invoice is deleted successfully',
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
    const invoice = this.invoiceService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, invoice);
  }
}
