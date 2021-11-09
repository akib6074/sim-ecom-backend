import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  InvoiceDetailsEntity,
  InvoiceDto,
  InvoiceEntity,
  isActive,
  isInActive,
  OrderEntity,
  ProductAttributeEntity,
  ProductEntity,
  SystemException,
  UserEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(InvoiceDetailsEntity)
    private readonly invoiceDetailRepository: Repository<InvoiceDetailsEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductAttributeEntity)
    private readonly productAttributeRepository: Repository<ProductAttributeEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
  ) {}

  async findAll(): Promise<InvoiceDto[]> {
    try {
      const invoices = await this.invoiceRepository.find({ ...isActive });
      return this.conversionService.toDtos<InvoiceEntity, InvoiceDto>(invoices);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(invoiceDto: InvoiceDto): Promise<InvoiceDto[]> {
    try {
      const invoices = await this.invoiceRepository.find({
        where: {
          ...invoiceDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<InvoiceEntity, InvoiceDto>(invoices);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[InvoiceDto[], number]> {
    try {
      const invoices = await this.invoiceRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<InvoiceEntity, InvoiceDto>(
        invoices,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByOrder(id: string): Promise<InvoiceDto[]> {
    try {
      const order = await this.getOrder(id);
      const invoices = await this.invoiceRepository.find({
        where: {
          order,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<InvoiceEntity, InvoiceDto>(invoices);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByUser(id: string): Promise<InvoiceDto[]> {
    try {
      const user = await this.getUser(id);
      const invoices = await this.invoiceRepository.find({
        where: {
          user,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<InvoiceEntity, InvoiceDto>(invoices);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getInvoice(id);
      const deleted = await this.invoiceRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<InvoiceDto> {
    try {
      const invoice = await this.getInvoice(id);
      return this.conversionService.toDto<InvoiceEntity, InvoiceDto>(invoice);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async getOrder(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(order, 'Order Not Found!!');
    return order;
  }

  async getInvoice(id: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(invoice, 'Invoice Not Found!!');
    return invoice;
  }

  async getUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(user, 'User Not Found!!');
    return user;
  }
}
