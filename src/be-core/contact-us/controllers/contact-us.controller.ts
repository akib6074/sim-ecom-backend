import { ContactUsService } from '../services/contact-us.service';
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
  ContactUsDto,
  CustomerGuard,
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

@ApiTags('Contact-Us')
@ApiBearerAuth()
@Controller('contact-us')
export class ContactUsController implements GeneralController<ContactUsDto> {
  constructor(
    private contactUsService: ContactUsService,
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
    const allContactUs = this.contactUsService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      allContactUs,
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
    contactUsDto: ContactUsDto,
  ): Promise<ResponseDto> {
    const allContactUs = this.contactUsService.findByObject(contactUsDto);
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      allContactUs,
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
    const allContactUs = this.contactUsService.pagination(
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
      allContactUs,
    );
  }

  @UseGuards(new CustomerGuard())
  @ApiCreatedResponse({
    description:
      'Message successfully sent! Authority will contact accordingly',
  })
  @ApiBody({ type: ContactUsDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    contactUsDto: ContactUsDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(contactUsDto);
    const contactUs = this.contactUsService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Message successfully sent! Authority will contact accordingly',
      contactUs,
    );
  }

  @UseGuards(new CustomerGuard())
  @ApiOkResponse({
    description:
      'Message successfully updated! Authority will contact accordingly',
  })
  @ApiBody({ type: ContactUsDto })
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
    contactUsDto: ContactUsDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(contactUsDto);
    const contactUs = this.contactUsService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Message successfully updated! Authority will contact accordingly',
      contactUs,
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
    const deleted = this.contactUsService.remove(id);
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
    const allContactUs = this.contactUsService.findById(id);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      null,
      allContactUs,
    );
  }
}
