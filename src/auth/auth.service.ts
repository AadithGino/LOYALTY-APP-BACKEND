import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { userLoginDto } from './dto/user.auth.dto';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService) { }

    async userLogin(dto:userLoginDto) {
        return await this.userService.userLogin(dto)
    }
}
