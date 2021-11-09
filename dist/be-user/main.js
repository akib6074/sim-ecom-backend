"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const ecom_common_1 = require("@test/ecom-common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('E-Com User Bootstrap');
    const microService = {
        name: configService.get('USER_SERVICE_NAME'),
        url: configService.get('USER_SERVICE_URL'),
        port: configService.get('USER_APP_PORT'),
    };
    app.connectMicroservice({
        name: microService.name,
        transport: microservices_1.Transport.REDIS,
        options: { url: microService.url },
    });
    app.setGlobalPrefix('api');
    const options = new swagger_1.DocumentBuilder()
        .setTitle('User microservice API')
        .setDescription('User microservice API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('test-user', app, document);
    app.enableCors();
    app.useGlobalFilters(new ecom_common_1.SystemExceptionFilter());
    app.useGlobalFilters(new ecom_common_1.FieldExceptionFilter());
    await app.startAllMicroservicesAsync();
    await app.listen(microService.port);
    logger.log(`User microservice is running in port:${microService.port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map