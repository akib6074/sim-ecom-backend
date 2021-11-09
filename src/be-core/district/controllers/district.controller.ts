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
  CreateDistrictDto,
  DistrictDto,
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
import { DistrictService } from '../services/district.service';

@ApiTags('District')
@ApiBearerAuth()
@Controller('districts')
export class DistrictController implements GeneralController<DistrictDto> {
  constructor(
    private districtService: DistrictService,
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
    const districts = this.districtService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, districts);
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
    districtDto: DistrictDto,
  ): Promise<ResponseDto> {
    const districts = this.districtService.findByObject(districtDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, districts);
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
    const districts = this.districtService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      districts,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/state/:id')
  findByState(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const districts = this.districtService.findByState(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, districts);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'District is added successfully',
  })
  @ApiBody({ type: CreateDistrictDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    districtDto: CreateDistrictDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(districtDto);
    const district = this.districtService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'District is added successfully',
      district,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'District is updated successfully',
  })
  @ApiBody({ type: CreateDistrictDto })
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
    districtDto: CreateDistrictDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(districtDto);
    const district = this.districtService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'District is updated successfully',
      district,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'District is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.districtService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'District is deleted successfully',
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
    const districts = this.districtService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, districts);
  }
}
