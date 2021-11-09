import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AddressDto,
  AddressEntity,
  ConversionService,
  DeleteDto,
  ExceptionService,
  GeneralService,
  isActive,
  isInActive,
  PermissionService,
  RequestService,
  UserEntity,
  CountryEntity,
  DistrictEntity,
  ThanaEntity,
  CreateAddressDto,
} from '@simec/ecom-common';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService implements GeneralService<AddressDto> {
  private readonly logger = new Logger(AddressService.name);

  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(DistrictEntity)
    private readonly districtRepository: Repository<DistrictEntity>,
    @InjectRepository(ThanaEntity)
    private readonly thanaRepository: Repository<ThanaEntity>,
    private readonly conversionService: ConversionService,
    private readonly exceptionService: ExceptionService,
    private readonly requestService: RequestService,
    private readonly permissionService: PermissionService,
  ) {}

  findAll = async (): Promise<AddressDto[]> => {
    const addresses = await this.addressRepository.find({
      where: { ...isActive },
    });
    return this.conversionService.toDtos<AddressEntity, AddressDto>(addresses);
  };

  findByObject = async (dto: AddressDto): Promise<AddressDto[]> => {
    const addresses = await this.addressRepository.find({
      where: {
        ...dto,
        isActive,
      },
    });
    return this.conversionService.toDtos<AddressEntity, AddressDto>(addresses);
  };

  create = async (dto: AddressDto): Promise<AddressDto> => {
    dto = this.requestService.forCreate(dto);

    const dtoToEntity = await this.conversionService.toEntity<
      AddressEntity,
      AddressDto
    >(dto);

    const address = await this.addressRepository.create(dtoToEntity);
    await this.addressRepository.save(address);
    return this.conversionService.toDto<AddressEntity, AddressDto>(address);
  };

  update = async (id: string, dto: AddressDto): Promise<AddressDto> => {
    const saveDto = await this.getAddress(id);

    const dtoToEntity = await this.conversionService.toEntity<
      AddressEntity,
      AddressDto
    >({ ...saveDto, ...dto });

    const updatedAddress = await this.addressRepository.save(dtoToEntity, {
      reload: true,
    });
    return this.conversionService.toDto<AddressEntity, AddressDto>(
      updatedAddress,
    );
  };

  remove = async (id: string): Promise<DeleteDto> => {
    const saveDto = await this.getAddress(id);

    const deleted = await this.addressRepository.save({
      ...saveDto,
      ...isInActive,
    });
    return Promise.resolve(new DeleteDto(!!deleted));
  };

  findById = async (id: string, relation = true): Promise<AddressDto> => {
    const address = await this.addressRepository.findOne({
      where: {
        id,
        ...isActive,
      },
      relations: relation ? ['country', 'state', 'district', 'thana'] : [],
    });
    this.exceptionService.notFound(address, 'Address not found!');
    return this.conversionService.toDto<AddressEntity, AddressDto>(address);
  };

  getCustomerShippingAddresses = async (): Promise<AddressDto[]> => {
    const user = await this.userRepository.findOne({
      where: {
        ...isActive,
        id: this.permissionService.returnRequest().userId,
      },
      relations: [
        'customer',
        'customer.shippingAddresses',
        'customer.shippingAddresses.country',
        'customer.shippingAddresses.state',
        'customer.shippingAddresses.district',
        'customer.shippingAddresses.thana',
      ],
    });
    this.exceptionService.notFound(user.customer, 'Customer not found!');
    const addresses = user.customer.shippingAddresses.filter(
      (address) => address.isActive,
    );
    return this.conversionService.toDtos<AddressEntity, AddressDto>(addresses);
  };

  editShippingAddress = async (
    id: string,
    dto: AddressDto,
  ): Promise<AddressDto> => {
    const saveDto = await this.getAddress(id);
    const dtoToEntity = await this.conversionService.toEntity<
      AddressEntity,
      AddressDto
    >({ ...saveDto, ...dto });
    const shippingAddress = await this.addressRepository.save(dtoToEntity, {
      reload: true,
    });
    const updatedAddress = await this.addressRepository.findOne({
      where: { id: shippingAddress.id },
      relations: ['district', 'thana'],
    });
    return this.conversionService.toDto<AddressEntity, AddressDto>(
      updatedAddress,
    );
  };

  addShippingAddress = async (dto: CreateAddressDto): Promise<AddressDto> => {
    const country = await this.countryRepository.findOne({
      where: {
        isoCode: 'BGD',
        ...isActive,
      },
    });

    const user = await this.userRepository.findOne({
      where: {
        ...isActive,
        id: this.permissionService.returnRequest().userId,
      },
      relations: ['customer'],
    });
    this.exceptionService.notFound(user.customer, 'Customer not found!');
    const dtoToEntity = await this.conversionService.toEntity<
      AddressEntity,
      AddressDto
    >(dto);
    const shippingAddress = await this.addressRepository.create(dtoToEntity);

    const district = await this.districtRepository.findOne({
      where: {
        ...isActive,
        id: shippingAddress.district,
      },
      relations: ['state'],
    });

    const thana = await this.thanaRepository.findOne({
      where: {
        ...isActive,
        id: shippingAddress.thana,
      },
    });
    const state = district.state;
    shippingAddress.customer = user.customer;
    shippingAddress.state = state;
    shippingAddress.district = district;
    shippingAddress.thana = thana;
    shippingAddress.country = country;
    await this.addressRepository.save(shippingAddress);
    return this.conversionService.toDto<AddressEntity, AddressDto>(
      shippingAddress,
    );
  };

  /************************ relations *******************/
  getAddress = async (id: string): Promise<AddressEntity> => {
    const address = await this.addressRepository.findOne({
      where: {
        id,
        ...isActive,
      },
    });
    this.exceptionService.notFound(address, 'Address not found!');
    return address;
  };
}
