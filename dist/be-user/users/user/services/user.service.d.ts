import { BcryptService, ConversionService, CreateUserDto, DeleteDto, ExceptionService, RequestService, UpdateUserDto, UserDto, UserEntity } from '@test/ecom-common';
import { Repository } from 'typeorm';
export declare class UserService {
    private readonly userRepository;
    private readonly conversionService;
    private readonly exceptionService;
    private readonly bcryptService;
    private readonly requestService;
    constructor(userRepository: Repository<UserEntity>, conversionService: ConversionService, exceptionService: ExceptionService, bcryptService: BcryptService, requestService: RequestService);
    findById: (id: string) => Promise<UserDto>;
    create: (createUserDto: CreateUserDto) => Promise<any>;
    createUser: (createUserDto: CreateUserDto) => Promise<UserEntity>;
    update: (id: string, dto: UpdateUserDto) => Promise<UserDto>;
    getUserAndProfile(id: string): Promise<UserEntity>;
    remove: (id: string) => Promise<DeleteDto>;
    getUser: (id: string) => Promise<UserEntity>;
    findOneByEmailOrPhone: (emailOrPhone: string) => Promise<UserDto>;
}
