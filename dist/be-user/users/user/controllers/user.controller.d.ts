import { CreateUserDto, ResponseDto, ResponseService, UpdateUserDto } from '@test/ecom-common';
import { UserService } from '../services/user.service';
export declare class UserController {
    private readonly userService;
    private readonly responseService;
    constructor(userService: UserService, responseService: ResponseService);
    findById(id: string): Promise<ResponseDto>;
    create(createUserDto: CreateUserDto): Promise<ResponseDto>;
    update(id: string, dto: UpdateUserDto): Promise<ResponseDto>;
    remove(id: string): Promise<ResponseDto>;
}
