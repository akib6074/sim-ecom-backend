"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ecom_common_1 = require("@test/ecom-common");
const typeorm_2 = require("typeorm");
let UserService = class UserService {
    constructor(userRepository, conversionService, exceptionService, bcryptService, requestService) {
        this.userRepository = userRepository;
        this.conversionService = conversionService;
        this.exceptionService = exceptionService;
        this.bcryptService = bcryptService;
        this.requestService = requestService;
        this.findById = async (id) => {
            try {
                const user = await this.userRepository.findOne({
                    where: { id },
                });
                this.exceptionService.notFound(user, 'User is not found');
                return this.conversionService.toDto(user);
            }
            catch (error) {
                throw new ecom_common_1.SystemException(error);
            }
        };
        this.create = async (createUserDto) => {
            try {
                const user = await this.createUser(createUserDto);
                return this.conversionService.toDto(user);
            }
            catch (error) {
                throw new ecom_common_1.SystemException(error);
            }
        };
        this.createUser = async (createUserDto) => {
            createUserDto.password = await this.bcryptService.hashPassword(createUserDto.password);
            let userDto = createUserDto;
            userDto = this.requestService.forCreate(userDto);
            const dtoToEntity = await this.conversionService.toEntity(userDto);
            const user = this.userRepository.create(dtoToEntity);
            user.isActive = ecom_common_1.ActiveStatus.enabled;
            await this.userRepository.save(user);
            return user;
        };
        this.update = async (id, dto) => {
            try {
                const saveDto = await this.getUserAndProfile(id);
                dto.password = await this.bcryptService.hashPassword(dto.password);
                dto = this.requestService.forUpdate(dto);
                const user = await this.conversionService.toEntity(Object.assign(Object.assign({}, saveDto), dto));
                const updatedUser = await this.userRepository.save(user, {
                    reload: true,
                });
                return this.conversionService.toDto(updatedUser);
            }
            catch (error) {
                throw new ecom_common_1.SystemException(error);
            }
        };
        this.remove = async (id) => {
            try {
                const saveDto = await this.getUser(id);
                const deleted = await this.userRepository.remove(saveDto);
                return Promise.resolve(new ecom_common_1.DeleteDto(!!deleted));
            }
            catch (error) {
                throw new ecom_common_1.SystemException(error);
            }
        };
        this.getUser = async (id) => {
            const user = await this.userRepository.findOne({
                where: { id },
            });
            this.exceptionService.notFound(user, 'User not found!');
            return user;
        };
        this.findOneByEmailOrPhone = async (emailOrPhone) => {
            try {
                const query = this.userRepository.createQueryBuilder('user');
                const user = await query
                    .where('(user.phone = :phone OR user.email = :email) and user.isActive = :isActive', Object.assign({ phone: emailOrPhone, email: emailOrPhone }, ecom_common_1.isActive))
                    .getOne();
                this.exceptionService.notFound(user, 'User is not found by phone or email');
                return await this.conversionService.toDto(user);
            }
            catch (error) {
                throw new ecom_common_1.SystemException(error);
            }
        };
    }
    async getUserAndProfile(id) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        this.exceptionService.notFound(user, 'User not found!');
        return user;
    }
};
UserService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(ecom_common_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ecom_common_1.ConversionService,
        ecom_common_1.ExceptionService,
        ecom_common_1.BcryptService,
        ecom_common_1.RequestService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map