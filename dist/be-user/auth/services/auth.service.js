"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ecom_common_1 = require("@test/ecom-common");
const jwt = __importStar(require("jsonwebtoken"));
const nestjs_redis_1 = require("nestjs-redis");
const user_service_1 = require("../../users/user/services/user.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(configService, bcryptService, userService, redisService) {
        this.configService = configService;
        this.bcryptService = bcryptService;
        this.userService = userService;
        this.redisService = redisService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto) {
        try {
            const user = await this.validateUser(loginDto);
            const userResponseDto = await this.generatePayload(user);
            const accessToken = await this.generateToken(userResponseDto, loginDto);
            await this.redisService
                .getClient(ecom_common_1.Redis.REDIS_SESSION)
                .set(accessToken, JSON.stringify(userResponseDto));
            userResponseDto.accessToken = accessToken;
            return Promise.resolve(userResponseDto);
        }
        catch (error) {
            throw new ecom_common_1.SystemException(error);
        }
    }
    async generateToken(payload, loginDto) {
        const privateKEY = this.configService
            .get('PRIVATE_KEY')
            .replace(/\\n/g, '\n');
        let accessToken;
        if (loginDto.isChecked === 1) {
            accessToken = jwt.sign(Object.assign({}, payload), privateKEY, {
                expiresIn: '365d',
                algorithm: 'RS256',
            });
        }
        else {
            accessToken = jwt.sign(Object.assign({}, payload), privateKEY, {
                expiresIn: '1h',
                algorithm: 'RS256',
            });
        }
        this.logger.log('access token: ' + accessToken);
        return Promise.resolve(accessToken);
    }
    async generatePayload(userDto) {
        const userResponseDto = new ecom_common_1.UserResponseDto();
        userResponseDto.userId = userDto.id;
        userResponseDto.phone = userDto.phone;
        userResponseDto.userName = userDto.firstName + ' ' + userDto.lastName;
        return Promise.resolve(userResponseDto);
    }
    async validateUser(loginDto) {
        try {
            const user = await this.userService.findOneByEmailOrPhone(loginDto.phone || loginDto.email);
            const isPasswordMatched = await this.bcryptService.comparePassword(loginDto.password, user === null || user === void 0 ? void 0 : user.password);
            if (!isPasswordMatched) {
                throw new ecom_common_1.SystemException({
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'User password is not valid',
                });
            }
            return user;
        }
        catch (error) {
            throw new ecom_common_1.SystemException(error);
        }
    }
};
AuthService = AuthService_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        ecom_common_1.BcryptService,
        user_service_1.UserService,
        nestjs_redis_1.RedisService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map