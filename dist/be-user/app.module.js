"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./users/user.module");
const public_url_1 = require("./public.url");
const ecom_common_1 = require("@test/ecom-common");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(ecom_common_1.PublicMiddleware).forRoutes('*');
        consumer
            .apply(ecom_common_1.AuthMiddleware)
            .exclude(...public_url_1.publicUrls)
            .forRoutes('*');
    }
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            ecom_common_1.configEnvironment(),
            ecom_common_1.configTypeorm(),
            ecom_common_1.configRedis(),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map