import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ActiveStatus,
  AddressEntity,
  Bool,
  CartEntity,
  ChangeOrderStatusDto,
  ConversionService,
  CreateOrderDto,
  DeleteDto,
  ExceptionService,
  GeneralService,
  InvoiceDetailsEntity,
  InvoiceEntity,
  InvoiceStatus,
  isActive,
  isInActive,
  OrderDetailsEntity,
  OrderDto,
  OrderEntity,
  PermissionService,
  RequestService,
  SystemException,
  TransMasterEntity,
  UserEntity,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from 'eventemitter2';
import { ProductCountEvent } from '../events/product-count.event';

@Injectable()
export class OrderService implements GeneralService<OrderDto> {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderDetailsEntity)
    private readonly orderDetailsRepository: Repository<OrderDetailsEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(InvoiceDetailsEntity)
    private readonly invoiceDetailsRepository: Repository<InvoiceDetailsEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(TransMasterEntity)
    private readonly transMasterRepository: Repository<TransMasterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly requestService: RequestService,
    private readonly permissionService: PermissionService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<OrderDto[]> {
    try {
      const orders = await this.orderRepository.find({ ...isActive });
      return this.conversionService.toDtos<OrderEntity, OrderDto>(orders);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(orderDto: OrderDto): Promise<OrderDto[]> {
    try {
      const orders = await this.orderRepository.find({
        where: {
          ...orderDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<OrderEntity, OrderDto>(orders);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
    status = 0,
  ): Promise<[OrderDto[], number]> {
    try {
      const user = this.permissionService.returnRequest();

      const where = { ...isActive };
      if (user && user.isCustomer) {
        where['user'] = await this.userRepository.findOne({
          where: { ...isActive, id: user.userId },
        });
      }
      if (status != 0) {
        where['status'] = status;
      }

      const orders = await this.orderRepository.findAndCount({
        where: { ...where },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
        relations: ['orderDetails', 'orderDetails.product'],
      });

      return this.conversionService.toPagination<OrderEntity, OrderDto>(orders);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByUser(id: string): Promise<OrderDto[]> {
    try {
      const user = await this.getUser(id);
      const orders = await this.orderRepository.find({
        where: {
          user,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<OrderEntity, OrderDto>(orders);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async create(dto: CreateOrderDto): Promise<OrderDto> {
    try {
      const cart = await this.getCart(dto.cartID);
      console.log(cart);

      const invoice = await this.generateInvoice(dto, cart);
      const order = await this.generateOrder(dto, cart, invoice);
      invoice.order = order;
      await this.invoiceRepository.save(invoice);
      await this.generateTransMaster(order, invoice);

      return this.conversionService.toDto<OrderEntity, OrderDto>(
        await this.getOrder(order.id),
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async generateInvoice(
    dto: CreateOrderDto,
    cart: CartEntity,
  ): Promise<InvoiceEntity> {
    try {
      let newInvoice = null;
      const invoiceDetails: InvoiceDetailsEntity[] = [];
      for (const cartDetailDto of cart.cartDetails) {
        const invoiceDetailEntity =
          this.requestService.forCreateEntity<InvoiceDetailsEntity>(
            new InvoiceDetailsEntity(),
          );
        invoiceDetailEntity.product = cartDetailDto.product;
        invoiceDetailEntity.productAttribute = cartDetailDto.productAttribute;
        invoiceDetailEntity.quantity = cartDetailDto.quantity;
        if (cartDetailDto.productAttribute) {
          invoiceDetailEntity.price = cartDetailDto.productAttribute.price;
        } else {
          invoiceDetailEntity.price = cartDetailDto.product.price;
        }
        const invoiceDetail = await this.invoiceDetailsRepository.create(
          invoiceDetailEntity,
        );
        await this.invoiceDetailsRepository.save(invoiceDetail);
        invoiceDetails.push(invoiceDetail);
      }

      newInvoice = this.requestService.forCreateEntity<InvoiceEntity>(
        new InvoiceEntity(),
      );

      newInvoice.invoiceDetails = invoiceDetails;
      newInvoice.user = await this.getUser(dto.userID);
      newInvoice.status = InvoiceStatus.UNPAID;

      await this.invoiceRepository.save(newInvoice);
      return newInvoice;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async generateOrder(
    dto: CreateOrderDto,
    cart: CartEntity,
    invoice: InvoiceEntity,
  ): Promise<OrderEntity> {
    try {
      const orderDetails: OrderDetailsEntity[] = [];
      for (const cartDetailDto of cart.cartDetails) {
        const orderDetailEntity =
          this.requestService.forCreateEntity<OrderDetailsEntity>(
            new OrderDetailsEntity(),
          );
        orderDetailEntity.product = cartDetailDto.product;
        orderDetailEntity.productAttribute = cartDetailDto.productAttribute;
        orderDetailEntity.quantity = cartDetailDto.quantity;

        if (cartDetailDto.productAttribute) {
          orderDetailEntity.price = cartDetailDto.productAttribute.price;
        } else {
          orderDetailEntity.price = cartDetailDto.product.price;
        }

        const orderDetail = await this.orderDetailsRepository.create(
          orderDetailEntity,
        );
        await this.orderDetailsRepository.save(orderDetail);
        orderDetails.push(orderDetail);
      }

      const orderEntity = this.requestService.forCreateEntity<OrderEntity>(
        new OrderEntity(),
      );
      orderEntity.cart = cart;
      orderEntity.invoice = invoice;
      orderEntity.orderDetails = orderDetails;
      orderEntity.user = await this.getUser(dto.userID);
      orderEntity.coupon = cart.coupon;
      orderEntity.reference = uuidv4().substring(0, 9);
      orderEntity.isActive = ActiveStatus.enabled;
      const order = this.orderRepository.create(orderEntity);
      await this.orderRepository.save(order);
      cart.order = order;
      await this.cartRepository.save(cart);
      const productCountEvent = new ProductCountEvent();
      productCountEvent.orderDetails = orderDetails;
      this.eventEmitter.emit('count.popular', productCountEvent);
      return order;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async generateTransMaster(
    order: OrderEntity,
    invoice: InvoiceEntity,
  ): Promise<TransMasterEntity> {
    try {
      let transMaster = new TransMasterEntity();
      transMaster.user = order.user;
      transMaster.invoice = invoice;
      transMaster.isPaid = Bool.No;

      let total = 0;
      for (const each of order.orderDetails) {
        if (each?.productAttribute) {
          total += Number(each?.productAttribute?.price || 0) * each.quantity;
        } else {
          total += Number(each?.product?.price || 0) * each.quantity;
        }
      }
      total =
        total -
        (order.coupon !== null
          ? order.coupon.reductionPercent > 0.0
            ? (total * order.coupon.reductionPercent) / 100.0
            : order.coupon.reductionAmount
          : 0.0);
      transMaster.totalAmount = total;

      transMaster =
        this.requestService.forCreateEntity<TransMasterEntity>(transMaster);

      const created = this.transMasterRepository.create(transMaster);

      await this.transMasterRepository.save(created);
      return created;
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async update(id: string, dto: CreateOrderDto): Promise<OrderDto> {
    try {
      const saveDto = await this.getOrder(id);

      if (dto.userID) saveDto.user = await this.getUser(dto.userID);

      const dtoToEntity = await this.conversionService.toEntity<
        OrderEntity,
        OrderDto
      >({ ...saveDto, ...dto });

      const updatedOrder = await this.orderRepository.save(dtoToEntity, {
        reload: true,
      });
      return this.conversionService.toDto<OrderEntity, OrderDto>(updatedOrder);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async updateOrderStatus(
    id: string,
    dto: ChangeOrderStatusDto,
  ): Promise<OrderDto> {
    try {
      const saveDto = await this.getOrder(id);

      const updatedOrderStatus = await this.orderRepository.save(
        { ...saveDto, ...dto },
        {
          reload: true,
        },
      );
      return this.conversionService.toDto<OrderEntity, OrderDto>(
        updatedOrderStatus,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getOrder(id);

      const deleted = await this.orderRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<OrderDto> {
    try {
      const order = await this.getOrder(id);
      order['transMaster'] = await this.getTransMaster(order.invoice);
      return this.conversionService.toDto<OrderEntity, OrderDto>(order);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  /********************** Start checking relations of post ********************/
  async getOrder(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        ...isActive,
      },
      relations: [
        'invoice',
        'cart',
        'cart.cartDetails',
        'cart.cartDetails.product',
        'cart.cartDetails.productAttribute',
        'user',
        'orderDetails',
        'orderDetails.product',
        'orderDetails.productAttribute',
        'shippingAddress',
        'billingAddress',
        'coupon',
      ],
    });
    this.exceptionService.notFound(order, 'Order Not Found!!');
    return order;
  }

  async getTransMaster(invoice: InvoiceEntity): Promise<TransMasterEntity> {
    const tm = await this.transMasterRepository.findOne({
      where: {
        invoice,
        ...isActive,
      },
    });
    this.exceptionService.notFound(tm, 'Trans Master Not Found!!');
    return tm;
  }

  async getCart(id: string): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: {
        id,
        ...isActive,
      },
      relations: [
        'cartDetails',
        'cartDetails.product',
        'cartDetails.productAttribute',
        'coupon',
      ],
    });
    this.exceptionService.notFound(cart, 'Cart Not Found!!');
    return cart;
  }
  async getCustomerLastInvoice(): Promise<InvoiceEntity> {
    const query = this.invoiceRepository.createQueryBuilder('invoice');
    const invoice = await query
      .innerJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.invoiceDetails', 'invoiceDetails')
      .leftJoinAndSelect('invoiceDetails.product', 'product')
      .leftJoinAndSelect('invoiceDetails.productAttribute', 'productAttribute')
      .leftJoinAndSelect('invoice.billingAddress', 'billingAddress')
      .leftJoinAndSelect('invoice.shippingAddress', 'shippingAddress')
      .where('user.id=:id', {
        id: this.permissionService.returnRequest().userId,
      })
      .andWhere('invoice.status =:status', { status: InvoiceStatus.UNPAID })
      .getOne();
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

  async setShippingAddress(
    cartId: string,
    shippingAddressId: string,
  ): Promise<OrderEntity> {
    try {
      const order = await this.orderRepository.findOne({
        where: {
          cart: cartId,
        },
      });
      const shippingAddress = await this.addressRepository.findOne({
        where: {
          id: shippingAddressId,
        },
      });

      const user = await this.userRepository.findOne({
        where: {
          id: this.permissionService.returnRequest().userId,
        },
        relations: ['address'],
      });
      order.billingAddress = user.address;
      order.shippingAddress = shippingAddress;
      // console.log(user);
      await this.orderRepository.save(order);
      this.exceptionService.notFound(order, 'Order Not Found!!');
      return order;
    } catch (error) {
      throw new SystemException(error);
    }
  }
  /*********************** End checking relations of post *********************/
}
