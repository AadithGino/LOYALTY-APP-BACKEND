import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt/dist';
import { Tokens } from './types/tokens.types';
import { userLoginDto, userSignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: process.env.AT_SECRET_KEY,
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: process.env.RT_SECRET_KEY,
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async userLogin(dto: userLoginDto) {
    const user = await this.userService.userLogin(dto);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.userService.updateRefreshToken(
      user._id.toString(),
      tokens.refresh_token,
    );
    return tokens;
  }

  async userSignUp(dto: userSignUpDto) {
    const user = await this.userService.userSignUp(dto);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.userService.updateRefreshToken(
      user._id.toString(),
      tokens.refresh_token,
    );
    return tokens;
  }

  async userLogout(userId: string) {
    return this.userService.userLogout(userId);
  }

  async refreshToken(userId: string, token: string) {
    const user = await this.userService.refreshToken(userId, token);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.userService.updateRefreshToken(userId, tokens.refresh_token);
    return tokens;
  }
}
