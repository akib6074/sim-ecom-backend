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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ecom_common_1 = require("@test/ecom-common");
const user_service_1 = require("../services/user.service");
let UserController = class UserController {
    constructor(userService, responseService) {
        this.userService = userService;
        this.responseService = responseService;
    }
    findById(id) {
        const userDto = this.userService.findById(id);
        return this.responseService.toDtoResponse(common_1.HttpStatus.OK, null, userDto);
    }
    create(createUserDto) {
        const userDto = this.userService.create(createUserDto);
        return this.responseService.toDtoResponse(common_1.HttpStatus.CREATED, 'Registration successful', userDto);
    }
    update(id, dto) {
        const userDto = this.userService.update(id, dto);
        return this.responseService.toDtoResponse(common_1.HttpStatus.OK, 'User updated successfully', userDto);
    }
    remove(id) {
        const deleted = this.userService.remove(id);
        return this.responseService.toResponse(common_1.HttpStatus.OK, 'User deleted successfully', deleted);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        status: common_1.HttpStatus.OK,
        description: '',
    }),
    common_1.HttpCode(common_1.HttpStatus.OK),
    common_1.Get(':id'),
    __param(0, common_1.Param('id', new ecom_common_1.UuidValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findById", null);
__decorate([
    swagger_1.ApiBody({ type: ecom_common_1.CreateUserDto }),
    swagger_1.ApiCreatedResponse({
        status: common_1.HttpStatus.CREATED,
        description: 'Registration successful',
    }),
    common_1.HttpCode(common_1.HttpStatus.CREATED),
    common_1.Post('registration'),
    __param(0, common_1.Body(new ecom_common_1.DtoValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ecom_common_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        status: common_1.HttpStatus.OK,
        description: 'User updated successfully',
    }),
    common_1.HttpCode(common_1.HttpStatus.OK),
    common_1.Put(':id'),
    __param(0, common_1.Param('id', new ecom_common_1.UuidValidationPipe())),
    __param(1, common_1.Body(new ecom_common_1.DtoValidationPipe({ skipMissingProperties: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ecom_common_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOkResponse({
        status: common_1.HttpStatus.OK,
        description: 'User deleted successfully',
    }),
    common_1.HttpCode(common_1.HttpStatus.OK),
    common_1.Delete(':id'),
    __param(0, common_1.Param('id', new ecom_common_1.UuidValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
UserController = __decorate([
    swagger_1.ApiTags('User'),
    common_1.Controller('users'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        ecom_common_1.ResponseService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map