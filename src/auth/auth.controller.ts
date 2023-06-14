import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userLoginDto } from './dto/user.auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    userLogin(@Body() dto:userLoginDto){
        return this.authService.userLogin(dto);
    }
}
