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
  AdminGuard,
  CreateStateDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  StateDto,
  UuidValidationPipe,
} from '@simec/ecom-common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StateService } from '../services/state.service';

@ApiTags('State')
@ApiBearerAuth()
@Controller('states')
export class StateController implements GeneralController<StateDto> {
  constructor(
    private stateService: StateService,
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
    const states = this.stateService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, states);
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
    stateDto: StateDto,
  ): Promise<ResponseDto> {
    const states = this.stateService.findByObject(stateDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, states);
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
    const states = this.stateService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      states,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('service-covered')
  findServiceCoveredByBD(): Promise<ResponseDto> {
    const serviceCovered = this.stateService.findServiceCoveredByBD();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      serviceCovered,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/country/:id')
  findByCountry(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const states = this.stateService.findByCountry(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, states);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'State is added successfully',
  })
  @ApiBody({ type: CreateStateDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    stateDto: CreateStateDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(stateDto);
    const state = this.stateService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'State is added successfully',
      state,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'State is updated successfully',
  })
  @ApiBody({ type: CreateStateDto })
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
    stateDto: CreateStateDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(stateDto);
    const state = this.stateService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'State is updated successfully',
      state,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'State is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.stateService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'State is deleted successfully',
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
    const states = this.stateService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, states);
  }
}
