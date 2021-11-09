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
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  AddressDto,
  AdminGuard,
  GeneralController,
  ResponseDto,
  ResponseService,
  UuidValidationPipe,
  CreateAddressDto,
} from '@simec/ecom-common';
import { AddressService } from '../services/address.service';

@ApiTags('Address')
@Controller('addresses')
export class AddressController implements GeneralController<AddressDto> {
  constructor(
    private readonly addressService: AddressService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get()
  findAll(): Promise<ResponseDto> {
    const addressDto = this.addressService.findAll();
    return this.responseService.toDtosResponse(HttpStatus.OK, null, addressDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findById(@Param('id') id: string): Promise<ResponseDto> {
    const addressDto = this.addressService.findById(id);
    return this.responseService.toDtoResponse(HttpStatus.OK, null, addressDto);
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('customer/shipping-addresses')
  getCustomerShippingAddresses(): Promise<ResponseDto> {
    const addressDtos = this.addressService.getCustomerShippingAddresses();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      null,
      addressDtos,
    );
  }

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Shipping address added successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Post('add-shipping-address')
  addShippingAddress(@Body() dto: CreateAddressDto): Promise<ResponseDto> {
    const addressDto = this.addressService.addShippingAddress(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Shipping address added successfully',
      addressDto,
    );
  }

  @ApiCreatedResponse({
    status: HttpStatus.OK,
    description: 'Shipping address edited successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Put('edit-shipping-address/:id')
  editShippingAddress(
    @Param('id') id: string,
    @Body() dto: AddressDto,
  ): Promise<ResponseDto> {
    const addressDto = this.addressService.editShippingAddress(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Shipping address edited successfully',
      addressDto,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Post('find')
  findOne(@Body() dto: AddressDto): Promise<ResponseDto> {
    const addresses = this.addressService.findByObject(dto);
    return this.responseService.toDtosResponse(HttpStatus.OK, null, addresses);
  }

  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Address created Successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: AddressDto): Promise<ResponseDto> {
    const addressDto = this.addressService.create(dto);
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Address created Successfully',
      addressDto,
    );
  }

  @UseGuards(new AdminGuard())
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Address updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: AddressDto,
  ): Promise<ResponseDto> {
    const addressDto = this.addressService.update(id, dto);
    return this.responseService.toDtoResponse(
      HttpStatus.OK,
      'Address updated successfully',
      addressDto,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Address deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  remove(
    @Param('id', new UuidValidationPipe()) id: string,
  ): Promise<ResponseDto> {
    const addressDto = this.addressService.remove(id);
    return this.responseService.toResponse(
      HttpStatus.OK,
      'Address deleted successfully',
      addressDto,
    );
  }
}
