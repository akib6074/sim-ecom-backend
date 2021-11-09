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
  CreateThanaDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  ThanaDto,
  UuidValidationPipe,
} from '@simec/ecom-common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThanaService } from '../services/thana.service';

@ApiTags('Thana')
@ApiBearerAuth()
@Controller('thanas')
export class ThanaController implements GeneralController<ThanaDto> {
  constructor(
    private thanaService: ThanaService,
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
    const thanas = this.thanaService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, thanas);
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
    thanaDto: ThanaDto,
  ): Promise<ResponseDto> {
    const thanas = this.thanaService.findByObject(thanaDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, thanas);
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
    const thanas = this.thanaService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      thanas,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/district/:id')
  findByDistrict(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const thanas = this.thanaService.findByDistrict(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, thanas);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Thana is added successfully',
  })
  @ApiBody({ type: CreateThanaDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    thanaDto: CreateThanaDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(thanaDto);
    const thana = this.thanaService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Thana is added successfully',
      thana,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Thana is updated successfully',
  })
  @ApiBody({ type: CreateThanaDto })
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
    thanaDto: CreateThanaDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(thanaDto);
    const thana = this.thanaService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Thana is updated successfully',
      thana,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Thana is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.thanaService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Thana is deleted successfully',
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
    const thanas = this.thanaService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, thanas);
  }
}
