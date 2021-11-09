import { LoginDto, ResponseService } from '@test/ecom-common';
import { AuthService } from '../services/auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly responseService;
    constructor(authService: AuthService, responseService: ResponseService);
    login(loginDto: LoginDto): Promise<import("@test/ecom-common").ResponseDto>;
}
