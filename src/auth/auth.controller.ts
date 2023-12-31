import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetUser } from 'src/shared/decorators/get-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { RtGuard } from 'src/shared/guards';
import {
  passwordResetDto,
  userLoginDto,
  userSignUpDto,
  validateOtpDto,
} from './dto';
import { Tokens } from './types/tokens.types';
import { JwtPayload } from './stragtegies';
import { RealIP } from 'nestjs-real-ip';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('/signup')
  userSignUp(
    @Body() dto: userSignUpDto,
    @RealIP() ip: string,
  ) {
    return this.authService.userSignUp(dto, ip);
  }

  @Public()
  @Post('/signup/:referal')
  userSignUpReferal(
    @Body() dto: userSignUpDto,
    @Param('referal') referalCode: string,
    @RealIP() ip: string,
  ) {
    return this.authService.userSignUpReferal(dto, referalCode, ip);
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  userLogin(@Body() dto: userLoginDto, @RealIP() ip: string) {
    return this.authService.userLogin(dto, ip);
  }

  @Public()
  @Post('refresh')
  @UseGuards(RtGuard)
  refreshTokens(@GetUser() user: any): Promise<Tokens> {
    return this.authService.refreshToken(user.sub, user.refreshToken);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  userLogout(@GetUser() user: JwtPayload) {
    return this.authService.userLogout(user.sub);
  }

  @Public()
  @Post('/password-reset')
  sendEmail(@Body() dto: passwordResetDto) {
    return this.authService.passWordReset(dto.email);
  }

  @Public()
  @Post('/validate-otp')
  validateOtp(@Body() dto: validateOtpDto): Promise<Tokens> {
    return this.authService.validateOtp(dto.email, dto.otp, dto.password);
  }

  @Public()
  @Post('/verify-email')
  verifyEmail(@Body() dto) {
    return this.authService.verifyEmail(dto.email, dto.otp);
  }
}
