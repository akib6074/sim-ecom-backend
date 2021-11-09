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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ecom_common_1 = require("@test/ecom-common");
const auth_service_1 = require("../services/auth.service");
let AuthController = class AuthController {
    constructor(authService, responseService) {
        this.authService = authService;
        this.responseService = responseService;
    }
    async login(loginDto) {
        const payload = this.authService.login(loginDto);
        return this.responseService.toResponse(common_1.HttpStatus.OK, 'Login is successful', payload);
    }
};
__decorate([
    swagger_1.ApiCreatedResponse({
        status: common_1.HttpStatus.OK,
        description: 'Login is successful',
    }),
    common_1.HttpCode(common_1.HttpStatus.OK),
    common_1.Post('login'),
    __param(0, common_1.Body(new ecom_common_1.DtoValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ecom_common_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
AuthController = __decorate([
    swagger_1.ApiTags('Auth'),
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        ecom_common_1.ResponseService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map