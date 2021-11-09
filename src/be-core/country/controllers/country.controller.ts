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
  CountryDto,
  CreateCountryDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CountryService } from '../services/country.service';

@ApiTags('Country')
@ApiBearerAuth()
@Controller('countries')
export class CountryController implements GeneralController<CountryDto> {
  constructor(
    private countryService: CountryService,
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
    const countries = this.countryService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, countries);
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
    countryDto: CountryDto,
  ): Promise<ResponseDto> {
    const countries = this.countryService.findByObject(countryDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, countries);
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
    const countries = this.countryService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      countries,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/currency/:id')
  findByCurrency(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const countries = this.countryService.findByCurrency(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, countries);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Country is added successfully',
  })
  @ApiBody({ type: CreateCountryDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    countryDto: CreateCountryDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(countryDto);
    const country = this.countryService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Country is added successfully',
      country,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Country is updated successfully',
  })
  @ApiBody({ type: CreateCountryDto })
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
    countryDto: CreateCountryDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(countryDto);
    const country = this.countryService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Country is updated successfully',
      country,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Country is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.countryService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Country is deleted successfully',
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
    const countries = this.countryService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, countries);
  }
}
