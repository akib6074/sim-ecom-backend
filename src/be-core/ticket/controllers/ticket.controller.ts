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
  RequestService,
  ResponseDto,
  ResponseService,
  TicketDto,
  UserGuard,
  UuidValidationPipe,
  CreateTicketDto,
  ChangeTicketStatusDto,
} from '@simec/ecom-common';
import { TicketService } from '../services/ticket.service';

@ApiTags('ticket')
@ApiBearerAuth()
@Controller('ticket')
export class TicketController implements GeneralController<TicketDto> {
  constructor(
    private ticketService: TicketService,
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
    const tickets = this.ticketService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, tickets);
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
    ticketDto: TicketDto,
  ): Promise<ResponseDto> {
    const tickets = this.ticketService.findByObject(ticketDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, tickets);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('change-ticket-status')
  changeTicketStatus(
    @Body(
      new DtoValidationPipe({
        skipMissingProperties: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    changeTicketStatusDto: ChangeTicketStatusDto,
  ): Promise<ResponseDto> {
    const ticket = this.ticketService.changeTicketStatus(changeTicketStatusDto);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, ticket);
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
    const tickets = this.ticketService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      tickets,
    );
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    description:
      'Message successfully sent! Authority will contact accordingly',
  })
  @ApiBody({ type: CreateTicketDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    ticketDto: CreateTicketDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(ticketDto);
    const ticket = this.ticketService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Message successfully sent! Authority will contact accordingly',
      ticket,
    );
  }

  @UseGuards(new UserGuard())
  @ApiOkResponse({
    description:
      'Message successfully updated! Authority will contact accordingly',
  })
  @ApiBody({ type: TicketDto })
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
    ticketDto: TicketDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(ticketDto);
    const ticket = this.ticketService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Message successfully updated! Authority will contact accordingly',
      ticket,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Message successfully deleted!',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.ticketService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Message successfully deleted!',
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
    const ticket = this.ticketService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, ticket);
  }
}
