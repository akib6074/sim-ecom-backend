import { ConfigService } from '@nestjs/config';
import { BcryptService, LoginDto, UserDto, UserResponseDto } from '@test/ecom-common';
import { RedisService } from 'nestjs-redis';
import { UserService } from '../../users/user/services/user.service';
export declare class AuthService {
    private readonly configService;
    private readonly bcryptService;
    private readonly userService;
    private readonly redisService;
    private readonly logger;
    constructor(configService: ConfigService, bcryptService: BcryptService, userService: UserService, redisService: RedisService);
    login(loginDto: LoginDto): Promise<UserResponseDto>;
    generateToken(payload: UserResponseDto, loginDto: LoginDto): Promise<string>;
    generatePayload(userDto: UserDto): Promise<UserResponseDto>;
    validateUser(loginDto: LoginDto): Promise<UserDto>;
}
