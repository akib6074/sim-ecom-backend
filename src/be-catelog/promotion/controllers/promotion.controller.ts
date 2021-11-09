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
  CreatePromotionDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  PromotionDto,
  RequestService,
  ResponseDto,
  ResponseService,
  ShopReviewDto,
  UserGuard,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { PromotionService } from '../services/promotion.service';

@ApiTags('Promotions')
@ApiBearerAuth()
@Controller('promotions')
export class PromotionController
  implements GeneralController<PromotionDto, ResponseDto>
{
  constructor(
    private promotionService: PromotionService,
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
    const promotions = this.promotionService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, promotions);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('latest-promotions')
  getLatestPromotions(): Promise<ResponseDto> {
    const promotions = this.promotionService.getLatestPromotions();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, promotions);
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
    dto: PromotionDto,
  ): Promise<ResponseDto> {
    const promotions = this.promotionService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, promotions);
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
    const promotions = this.promotionService.pagination(
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
      promotions,
    );
  }

  @UseGuards(new UserGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Promotion is added successfully',
  })
  @ApiBody({ type: CreatePromotionDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CreatePromotionDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const promotion = this.promotionService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Promotion added successfully',
      promotion,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Promotion is updated successfully',
  })
  @ApiBody({ type: ShopReviewDto })
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
    dto: PromotionDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const promotion = this.promotionService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Promotion is updated successfully',
      promotion,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Promotion is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.promotionService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Promotion is deleted successfully',
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
    const promotion = this.promotionService.findById(id, false);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, promotion);
  }
}
