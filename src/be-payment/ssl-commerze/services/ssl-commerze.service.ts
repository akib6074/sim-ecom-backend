import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  ConversionService,
  isActive,
  OnlinePaymentActivityLogEntity,
  SslPrepareDto,
  SslPrepareEntity,
  SslProductProfileEnum,
  SslResponseDto,
  SslShippingMethodEnum,
  OnlinePaymentActivityLogDto,
  SystemException,
  InvoiceEntity,
  OrderEntity,
  InvoiceStatus,
  OrderStatus,
} from '@simec/ecom-common';

import SSLCommerz from 'sslcommerz-nodejs';
import {TransMasterService} from '../../trans-master/services/trans-master.service';

@Injectable()
export class SslCommerzeService {
  constructor(
    @InjectRepository(SslPrepareEntity) private readonly sslPrepareRepository: Repository<SslPrepareEntity>,
    @InjectRepository(OnlinePaymentActivityLogEntity) private readonly onlinePaymentActivityLogRepository: Repository<OnlinePaymentActivityLogEntity>,
    @InjectRepository(InvoiceEntity) private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(OrderEntity) private readonly orderRepository: Repository<OrderEntity>,
    private readonly conversionService: ConversionService,
    private readonly transMasterService: TransMasterService,
    private readonly configService: ConfigService) { }

  prepare = async (transMaster: {
    order: string;
    cart_json: any;
  }): Promise<SslResponseDto> => {
    try {
      const tm = await this.transMasterService.findByInvoiceOrID(
        null,
        transMaster.order,
      );

      const sslData = new SslPrepareDto();
      sslData.total_amount = tm.totalAmount || 0;
      sslData.tran_id = tm?.id;

      sslData.success_url = `${this.configService.get('PAYMENT_SUCCESS_URL')}${sslData.tran_id
        }`;
      sslData.fail_url = `${this.configService.get('PAYMENT_FAIL_URL')}`;
      sslData.cancel_url = `${this.configService.get('PAYMENT_CANCEL_URL')}`;
      // sslData.ipn_url = '';

      sslData.cus_name = `${tm?.user?.firstName || ''} ${tm?.user?.lastName || ''
        }`;
      sslData.cus_email = `${tm?.user?.email || ''}`;
      sslData.cus_phone = `${tm?.user?.phone || ''}`;

      sslData.cus_add1 = `${tm?.user?.address?.address || 'test-address'}`;
      sslData.cus_city = `${tm?.user?.address?.state.name || ''}`;
      sslData.cus_country = `${tm?.user?.address?.country.name || ''}`;
      sslData.cus_postcode = `${tm?.user?.address?.thana.name || ''}`;

      sslData.shipping_method = SslShippingMethodEnum.NO;

      sslData.product_name = 'test-product';
      sslData.product_category = 'test-product-category';
      sslData.num_of_item = 1;

      sslData.product_profile = SslProductProfileEnum.GENERAL;
      sslData.product_amount = tm?.totalAmount;

      sslData.emi_option = 0;
      sslData.multi_card_name = '';
      sslData.allowed_bin = '';
      sslData.cart = [
        {
          amount: tm?.totalAmount,
          product: sslData.product_name,
        },
      ];
      sslData.value_a = tm?.user?.id;
      sslData.value_b = tm?.invoice?.id;
      sslData.value_c = transMaster.order;
      // console.log(transMaster.order, ' 🔥🔥🔥🔥🔥🔥🔥 ', tm?.invoice?.id)

      const dtoToEntity = await this.conversionService.toEntity<SslPrepareEntity, SslPrepareDto>(sslData);

      const prepareSslDto = this.sslPrepareRepository.create(dtoToEntity);
      await this.sslPrepareRepository.save(prepareSslDto);

      /********** ssl commerze init ********************/
      const settings = {
        isSandboxMode: Boolean(this.configService.get('PAYMENT_STORE_SANDBOX')),
        store_id: this.configService.get('PAYMENT_STORE_ID'),
        store_passwd: this.configService.get('PAYMENT_STORE_PASSWORD'),
      };

      sslData['currency'] = this.configService.get('PAYMENT_STORE_CURRENCY');

      const sslcz = new SSLCommerz(settings);
      const transaction: SslResponseDto = await sslcz.init_transaction(sslData);
      transaction.status = transaction.status.toLowerCase();

      /********** ssl commerze end=========================== ********************/
      return Promise.resolve(transaction);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  success = async (id: string, paymentDto: OnlinePaymentActivityLogDto) => {
    if (!(await this.alreadyDone(paymentDto.id))) {
      try {
        const dtoToEntity = await this.conversionService.toEntity<OnlinePaymentActivityLogEntity, OnlinePaymentActivityLogDto>(paymentDto);
        const paymentSuccessResponse = this.onlinePaymentActivityLogRepository.create(dtoToEntity);
        // store the successful online payment activity log
        await this.onlinePaymentActivityLogRepository.save(paymentSuccessResponse);
        // update the invoice from unpaid to paid by invoice id
        await this.invoiceRepository.update({ id: paymentDto.value_b }, { status: InvoiceStatus.PAID })
        // update the order from pending to confirm by order id
        await this.orderRepository.update({ id: paymentDto.value_a }, { status: OrderStatus.Confirmed })
        // return the payment success response
        return this.conversionService.toDto<OnlinePaymentActivityLogEntity, OnlinePaymentActivityLogDto>(paymentSuccessResponse);
      } catch (error) {
        throw new SystemException(error);
      }
    }
  };

  failOrCancel = async (dto: OnlinePaymentActivityLogDto): Promise<OnlinePaymentActivityLogDto> => {
    try {
      const dtoToEntity = await this.conversionService.toEntity<OnlinePaymentActivityLogEntity, OnlinePaymentActivityLogDto>(dto);
      const paymentFailedResponse = this.onlinePaymentActivityLogRepository.create(dtoToEntity);
      // store the failed online payment activity log
      await this.onlinePaymentActivityLogRepository.save(paymentFailedResponse);
      // return the payment failed response
      return this.conversionService.toDto<OnlinePaymentActivityLogEntity, OnlinePaymentActivityLogDto>(paymentFailedResponse);
    } catch (error) {
      throw new SystemException(error);
    }
  };

  alreadyDone = async (id: string): Promise<boolean> => {
    const sslValidate = await this.onlinePaymentActivityLogRepository.findOne({
      id,
      ...isActive,
    });
    return await this.transMasterService.findByValID(sslValidate);
  };
}
