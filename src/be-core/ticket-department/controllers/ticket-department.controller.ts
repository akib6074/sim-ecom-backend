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
  TicketDepartmentDto,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { TicketDepartmentService } from '../services/ticket-department.service';

@ApiTags('department')
@ApiBearerAuth()
@Controller('department')
export class TicketDepartmentController
  implements GeneralController<TicketDepartmentDto>
{
  constructor(
    private departmentService: TicketDepartmentService,
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
    const departments = this.departmentService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      departments,
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
    departmentDto: TicketDepartmentDto,
  ): Promise<ResponseDto> {
    const departments = this.departmentService.findByObject(departmentDto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      departments,
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
    const departments = this.departmentService.pagination(
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
      departments,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    description:
      'Message successfully sent! Authority will contact accordingly',
  })
  @ApiBody({ type: TicketDepartmentDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    departmentDto: TicketDepartmentDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(departmentDto);
    const department = this.departmentService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Message successfully sent! Authority will contact accordingly',
      department,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    description:
      'Message successfully updated! Authority will contact accordingly',
  })
  @ApiBody({ type: TicketDepartmentDto })
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
    departmentDto: TicketDepartmentDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(departmentDto);
    const department = this.departmentService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Message successfully updated! Authority will contact accordingly',
      department,
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
    const deleted = this.departmentService.remove(id);
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
    const department = this.departmentService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, department);
  }
}
