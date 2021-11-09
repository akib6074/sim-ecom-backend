"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicUrls = void 0;
const common_1 = require("@nestjs/common");
exports.publicUrls = [
    { path: '/api/auth/login', method: common_1.RequestMethod.POST },
    { path: '/api/users/registration', method: common_1.RequestMethod.POST },
];
//# sourceMappingURL=public.url.js.map