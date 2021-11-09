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
  CreateNoteDto,
  DtoValidationPipe,
  GeneralController,
  IntValidationPipe,
  NoteDto,
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
import { NoteService } from '../services/note.service';

@ApiTags('Note')
@ApiBearerAuth()
@Controller('notes')
export class NoteController implements GeneralController<NoteDto> {
  constructor(
    private noteService: NoteService,
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
    const notes = this.noteService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, notes);
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
    noteDto: NoteDto,
  ): Promise<ResponseDto> {
    const notes = this.noteService.findByObject(noteDto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, notes);
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
    const notes = this.noteService.pagination(page, limit, sort, order);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      notes,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/employee/:id')
  findByEmployee(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const notes = this.noteService.findByEmployee(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, notes);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/customer/:id')
  findByCustomer(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const notes = this.noteService.findByCustomer(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, notes);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('find/affiliator/:id')
  findByAffiliator(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const notes = this.noteService.findByAffiliator(id);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, notes);
  }

  @UseGuards(new AdminGuard())
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Note is added successfully',
  })
  @ApiBody({ type: CreateNoteDto })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(
    @Body(
      new DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    noteDto: CreateNoteDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forCreate(noteDto);
    const note = this.noteService.create(modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Note is added successfully',
      note,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Note is updated successfully',
  })
  @ApiBody({ type: CreateNoteDto })
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
    noteDto: CreateNoteDto,
  ): Promise<ResponseDto> {
    const modifiedDto = this.requestService.forUpdate(noteDto);
    const note = this.noteService.update(id, modifiedDto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Note is updated successfully',
      note,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Note is deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const deleted = this.noteService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Note is deleted successfully',
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
    const notes = this.noteService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, notes);
  }
}
