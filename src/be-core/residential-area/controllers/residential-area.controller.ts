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
  CreateResidentialAreaDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResidentialAreaDto,
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
import { ResidentialAreaService } from '../services/residential-area.service';

@ApiTags('Residential Area')
@ApiBearerAuth()
@Controller('residentialAreas')
export class ResidentialAreaController
  implements GeneralController<ResidentialAreaDto>
{
  constructor(
    private residentialAreaService: ResidentialAreaService,
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
    const residentialAreas = this.residentialAreaService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      residentialAreas,
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
    residentialAreaDto: ResidentialAreaDto,
  ): Promise<ResponseDto> {
    const residentialAreas =
      this.residentialAreaService.findByObject(residentialAreaDto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      residentialAreas,
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
    const residentialAreas = this.residentialAreaService.pagination(
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
      residentialAreas,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/cart/:id')
  findByThana(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const residentialAreas = this.residentialAreaService.findByThana(id);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      residentialAreas,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'ResidentialArea is added successfully',
  })
  @ApiBody({ type: CreateResidentialAreaDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    residentialAreaDto: CreateResidentialAreaDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(residentialAreaDto);
    const residentialArea = this.residentialAreaService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'ResidentialArea is added successfully',
      residentialArea,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'ResidentialArea is updated successfully',
  })
  @ApiBody({ type: CreateResidentialAreaDto })
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
    residentialAreaDto: CreateResidentialAreaDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(residentialAreaDto);
    const residentialArea = this.residentialAreaService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'ResidentialArea is updated successfully',
      residentialArea,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'ResidentialArea is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.residentialAreaService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'ResidentialArea is deleted successfully',
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
    const residentialAreas = this.residentialAreaService.findById(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      residentialAreas,
    );
  }
}
