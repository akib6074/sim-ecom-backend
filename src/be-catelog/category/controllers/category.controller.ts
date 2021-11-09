import {
  Body,
  CacheKey,
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
  UseInterceptors,
} from '@nestjs/common';
import {
  AdminGuard,
  CategoryDto,
  DtoValidationPipe,
  GeneralController,
  HttpCacheInterceptor,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { CategoryService } from '../services/category.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EcomCatelogCacheKeyEnum } from '../../../cache/ecom-cache-key.enum';

@ApiTags('Category')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController
  implements GeneralController<CategoryDto, ResponseDto>
{
  constructor(
    private categoryService: CategoryService,
    private readonly responseService: ResponseService,
    private readonly requestService: RequestService,
  ) {}

  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(EcomCatelogCacheKeyEnum.CATEGORY_FIND_ALL)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<ResponseDto> {
    const categories = this.categoryService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, categories);
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
    dto: CategoryDto,
  ): Promise<ResponseDto> {
    const categories = this.categoryService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, categories);
  }

  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(EcomCatelogCacheKeyEnum.CATEGORY_TREES)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('trees')
  findTrees(): Promise<ResponseDto> {
    const categoryDto = this.categoryService.findTrees();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      categoryDto,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('roots')
  findRoots(): Promise<ResponseDto> {
    const categoryDto = this.categoryService.findRoots();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      categoryDto,
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
    const categories = this.categoryService.pagination(
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
      categories,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('children/:parent_id')
  findChildren(
    @Param('parent_id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const categoryDto = this.categoryService.findChildren(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, categoryDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('parent/:child_id')
  findParent(
    @Param('child_id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const categoryDto = this.categoryService.findParent(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, categoryDto);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Category is added successfully',
  })
  @ApiBody({ type: CategoryDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CategoryDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const category = this.categoryService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Category added successfully',
      category,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Category is updated successfully',
  })
  @ApiBody({ type: CategoryDto })
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
    dto: CategoryDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(dto);
    const category = this.categoryService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Category is updated successfully',
      category,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Category is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.categoryService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Category is deleted successfully',
      deleted,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Category added as child successfully',
  })
  @ApiBody({ type: CategoryDto })
  @Post('child/:parent_id')
  createChild(
    @Param('parent_id', new UuidValidationPipe()) id: string,
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CategoryDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const category = this.categoryService.createChild(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Category added as child successfully',
      category,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Category updated successfully',
  })
  @ApiBody({ type: CategoryDto })
  @Put('child/:id/:parent_id')
  updateChild(
    @Param('id', new UuidValidationPipe()) id: string,
    @Param('parent_id', new UuidValidationPipe()) parentID: string,
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: CategoryDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(dto);
    const category = this.categoryService.updateChild(
      id,
      parentID,
      modifiedDto,
    );
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Category updated successfully',
      category,
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
    const categoryDto = this.categoryService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, categoryDto);
  }
}
