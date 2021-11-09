import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  IntValidationPipe,
  ProductDto,
  ResponseDto,
  ResponseService,
  FloatValidationPipe,
} from '@simec/ecom-common';

@ApiTags('Product Search')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly responseService: ResponseService,
  ) {}

  @MessagePattern({ service: 'products', cmd: 'post', method: 'rebase' })
  async rebase(@Payload() products: ProductDto[]): Promise<any> {
    return await this.productService.rebase(products);
  }

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
  async findProducts(
    @Query('q') query: string,
    @Query('p', new IntValidationPipe()) page: number,
    @Query('l', new IntValidationPipe()) limit: number,
  ): Promise<ResponseDto> {
    const products = await this.productService.search(query, page, limit);
    return this.responseService.toPaginationResponse(
      HttpStatus.OK,
      null,
      page,
      limit,
      products,
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
  async findProductsByLocation(
    @Query('p', new IntValidationPipe()) page: number,
    @Query('l', new IntValidationPipe()) limit: number,
    @Query('lat', new FloatValidationPipe()) lat: number,
    @Query('lng', new FloatValidationPipe()) lng: number,
  ): Promise<ResponseDto> {
    const shops = await this.productService.searchByLocation(
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

  @MessagePattern({ service: 'products', cmd: 'post', method: 'index' })
  async index(@Payload() productDto: ProductDto): Promise<any> {
    return await this.productService.index(productDto);
  }

  @MessagePattern({ service: 'products', cmd: 'delete', method: 'remove' })
  async remove(@Payload() id: string): Promise<any> {
    return await this.productService.remove(id);
  }
}
