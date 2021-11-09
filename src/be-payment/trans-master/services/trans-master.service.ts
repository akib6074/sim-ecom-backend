import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConversionService,
  DeleteDto,
  ExceptionService,
  isActive,
  isInActive,
  PermissionService,
  RequestService,
  SystemException,
  UserEntity,
  InvoiceEntity,
  TransMasterEntity,
  OnlinePaymentActivityLogEntity,
  TransMasterDto,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class TransMasterService {
  private readonly logger = new Logger(TransMasterService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(TransMasterEntity)
    private readonly transMasterRepository: Repository<TransMasterEntity>,
    @InjectRepository(OnlinePaymentActivityLogEntity)
    private readonly OnlinePaymentActivityLogRepository: Repository<OnlinePaymentActivityLogEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly requestService: RequestService,
    private readonly permissionService: PermissionService,
  ) {}

  async findAll(): Promise<TransMasterDto[]> {
    try {
      const transMasters = await this.transMasterRepository.find({
        ...isActive,
      });
      return this.conversionService.toDtos<TransMasterEntity, TransMasterDto>(
        transMasters,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByObject(
    transMasterDto: TransMasterDto,
  ): Promise<TransMasterDto[]> {
    try {
      const transMasters = await this.transMasterRepository.find({
        where: {
          ...transMasterDto,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<TransMasterEntity, TransMasterDto>(
        transMasters,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async pagination(
    page: number,
    limit: number,
    sort: string,
    order: string,
  ): Promise<[TransMasterDto[], number]> {
    try {
      const transMasters = await this.transMasterRepository.findAndCount({
        where: { ...isActive },
        skip: (page - 1) * limit,
        take: limit,
        order: {
          [sort !== 'undefined' ? sort : 'updatedAt']:
            sort !== 'undefined' ? order : 'DESC',
        },
      });

      return this.conversionService.toPagination<
        TransMasterEntity,
        TransMasterDto
      >(transMasters);
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByInvoice(id: string): Promise<TransMasterDto[]> {
    try {
      const invoice = await this.getInvoice(id);
      const transMasters = await this.transMasterRepository.find({
        where: {
          invoice,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<TransMasterEntity, TransMasterDto>(
        transMasters,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findByUser(id: string): Promise<TransMasterDto[]> {
    try {
      const user = await this.getUser(id);
      const transMasters = await this.transMasterRepository.find({
        where: {
          user,
          ...isActive,
        },
      });
      return this.conversionService.toDtos<TransMasterEntity, TransMasterDto>(
        transMasters,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async remove(id: string): Promise<DeleteDto> {
    try {
      const saveDto = await this.getTransMaster(id);
      const deleted = await this.transMasterRepository.save({
        ...saveDto,
        ...isInActive,
      });
      return Promise.resolve(new DeleteDto(!!deleted));
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async findById(id: string): Promise<TransMasterDto> {
    try {
      const transMaster = await this.getTransMaster(id);
      return this.conversionService.toDto<TransMasterEntity, TransMasterDto>(
        transMaster,
      );
    } catch (error) {
      throw new SystemException(error);
    }
  }

  async getTransMaster(id: string): Promise<TransMasterEntity> {
    const cart = await this.transMasterRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(cart, 'Cart Not Found!!');
    return cart;
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

  findByInvoiceOrID = async (
    invoice: InvoiceEntity = null,
    id: string = null,
  ): Promise<TransMasterDto> => {
    const where = { ...isActive };
    if (id) where['id'] = id;
    if (invoice) where['invoice'] = invoice;

    const transMaster = await this.transMasterRepository.findOne(where, {
      relations: [
        'user',
        'invoice',
        'invoice.invoiceDetails',
        'invoice.invoiceDetails.product',
        'invoice.invoiceDetails.productAttribute',
      ],
    });
    this.exceptionService.notFound(
      transMaster,
      'Trans Master Info not found!!!',
    );
    return this.conversionService.toDto<TransMasterEntity, TransMasterDto>(
      transMaster,
    );
  };

  findByValID = async (
    onlinePaymentActivityLog: OnlinePaymentActivityLogEntity,
  ): Promise<boolean> => {
    const transMaster = await this.transMasterRepository.findOne({
      onlinePaymentActivityLog,
      ...isActive,
    });
    return !!transMaster;
  };
}
