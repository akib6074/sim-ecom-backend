/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  FloatValidationPipe,
  IntValidationPipe,
  ResponseDto,
  ResponseService,
  ShopDto,
} from '@simec/ecom-common';
import { ShopService } from '../services/shop.service';

@ApiTags('Shop Search')
@Controller('shops')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly responseService: ResponseService,
  ) {}

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('search')
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'p',
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: 'l',
    required: true,
    type: Number,
  })
  async findShops(
    @Query('q') query: string,
    @Query('p', new IntValidationPipe()) page: number,
    @Query('l', new IntValidationPipe()) limit: number,
  ): Promise<ResponseDto> {
    const shops = await this.shopService.search(query, page, limit);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      shops,
    );
  }

  @ApiOkResponse({
    status: HttpStatus.OK,
    description: '',
  })
  @HttpCode(HttpStatus.OK)
  @Get('search/location')
  @ApiQuery({
    name: 'p',
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: 'l',
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: 'lat',
    required: true,
    type: Number,
  })
  @ApiQuery({
    name: 'lng',
    required: true,
    type: Number,
  })
  async findShopsByLocation(
    @Query('p', new IntValidationPipe()) page: number,
    @Query('l', new IntValidationPipe()) limit: number,
    @Query('lat', new FloatValidationPipe()) lat: number,
    @Query('lng', new FloatValidationPipe()) lng: number,
  ): Promise<ResponseDto> {
    const shops = await this.shopService.searchByLocation(
      page,
      limit,
      lat,
      lng,
    );
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      shops,
    );
  }

  @MessagePattern({ service: 'shops', cmd: 'post', method: 'index' })
  async index(@Payload() shopDto: ShopDto): Promise<any> {
    return await this.shopService.index(shopDto);
  }

  @MessagePattern({ service: 'shops', cmd: 'post', method: 'rebase' })
  async rebase(@Payload() shops: ShopDto[]): Promise<any> {
    return await this.shopService.rebase(shops);
  }

  @MessagePattern({ service: 'shops', cmd: 'delete', method: 'remove' })
  async remove(@Payload() id: string): Promise<any> {
    return await this.shopService.remove(id);
  }
}
