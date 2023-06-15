import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { RtGuard } from 'src/shared/guards';
import { userLoginDto, userSignUpDto } from './dto';
import { Tokens } from './types/tokens.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signup')
  userSignUp(@Body() dto: userSignUpDto):Promise<Tokens> {
    return this.authService.userSignUp(dto);
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  userLogin(@Body() dto: userLoginDto):Promise<Tokens> {
    return this.authService.userLogin(dto);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RtGuard)
  refreshTokens(@GetUser() user: any) {
    return this.authService.refreshToken(user.sub, user.refreshToken);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  userLogout(@GetUser() user: any) {
    return this.authService.userLogout(user.sub);
  }
}
