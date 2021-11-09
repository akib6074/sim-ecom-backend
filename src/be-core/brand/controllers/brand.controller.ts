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
  UseGuards
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
  UuidValidationPipe,
} from '@simec/ecom-common';
import { BrandDto } from '@simec/ecom-common/dist/dto/core/brand.dto';
import { BrandService } from '../services/brand.service';

@ApiTags('brand')
@ApiBearerAuth()
@Controller('brand')
export class BrandController implements GeneralController<BrandDto> {
  constructor(
    private brandService: BrandService,
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
    const brands = this.brandService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      brands,
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
    brandDto: BrandDto,
  ): Promise<ResponseDto> {
    const brands = this.brandService.findByObject(brandDto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      brands,
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
    const brands = this.brandService.pagination(
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
      brands,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    description:
      'Message successfully sent! Authority will contact accordingly',
  })
  @ApiBody({ type: BrandDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    brandDto: BrandDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(brandDto);
    const brand = this.brandService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Message successfully sent! Authority will contact accordingly',
      brand,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    description:
      'Message successfully updated! Authority will contact accordingly',
  })
  @ApiBody({ type: BrandDto })
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
    brandDto: BrandDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(brandDto);
    const brand = this.brandService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Message successfully updated! Authority will contact accordingly',
      brand,
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
    const deleted = this.brandService.remove(id);
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
    const brand = this.brandService.findById(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      brand,
    );
  }
}
