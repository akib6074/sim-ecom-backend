import { HttpModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BcryptService,
  ExceptionService,
  ResponseService,
} from '@simec/ecom-common';
import { UserModule } from '../users/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [HttpModule, UserModule],
  providers: [
    AuthService,
    BcryptService,
    ExceptionService,
    ResponseService,
    ConfigService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
