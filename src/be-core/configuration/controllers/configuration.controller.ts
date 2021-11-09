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
  ConfigurationDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  RequestService,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
} from '@simec/ecom-common';
import { ConfigurationService } from '../services/configuration.service';

@ApiTags('configuration')
@ApiBearerAuth()
@Controller('configurations')
export class ConfigurationController
  implements GeneralController<ConfigurationDto>
{
  constructor(
    private configurationService: ConfigurationService,
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
    const configuration = this.configurationService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      configuration,
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
    configurationDto: ConfigurationDto,
  ): Promise<ResponseDto> {
    const configurations = this.configurationService.findByObject(configurationDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, configurations);
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
    const configurations = this.configurationService.pagination(
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
      configurations,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    description:
      'Message successfully sent! Authority will contact accordingly',
  })
  @ApiBody({ type: ConfigurationDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    configurationDto: ConfigurationDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(configurationDto);
    const configuration = this.configurationService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Message successfully sent! Authority will contact accordingly',
      configuration,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    description:
      'Message successfully updated! Authority will contact accordingly',
  })
  @ApiBody({ type: ConfigurationDto })
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
    configurationDto: ConfigurationDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(configurationDto);
    const configuration = this.configurationService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Message successfully updated! Authority will contact accordingly',
      configuration,
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
    const deleted = this.configurationService.remove(id);
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
    const configuration = this.configurationService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, configuration);
  }
}
