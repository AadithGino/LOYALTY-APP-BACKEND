import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt/dist';
import { Tokens } from './types/tokens.types';
import { userLoginDto, userSignUpDto } from './dto';
import * as bcrypt from 'bcrypt';
import * as schedule from 'node-schedule';
import { MailerService } from '@nestjs-modules/mailer/dist';
import { PointsService } from 'src/points/points.service';

@Injectable()
export class AuthService {
  private resetJob: schedule.Job;
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
    private readonly pointService: PointsService,
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

  async sendEmailOTP(email: string, otp: string) {
    const noReplyEmail = `no-reply@${process.env.NODEMAILER_USERNAME}`; // Set the no-reply email address
    await this.mailService.sendMail({
      to: email,
      from: noReplyEmail,
      subject: 'Password Reset',
      template: 'password-reset',
      context: { otp },
    });
    return { message: 'Otp has been send successfully to your email address' };
  }

  async sendEmailCredentials(
    email: string,
    username: string,
    password: string,
  ) {
    await this.mailService.sendMail({
      to: email,
      from: process.env.NODEMAILER_USERNAME,
      subject: 'Adam Loyalty APP SignUp',
      template: 'credentials',
      context: { username, password },
    });
    return { message: 'Otp has been send successfully to your email address' };
  }

  generateOTP(): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters.charAt(randomIndex);
    }
    return otp;
  }

  async userSignUp(dto: userSignUpDto, ip: string) {
    const password = dto.password;
    const user = await this.userService.userSignUp(dto, ip);
    // await this.sendEmailCredentials(user.email, user.username, password);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.userService.updateRefreshTokenandIpAddress(
      user._id.toString(),
      tokens.refresh_token,
      ip,
    );
    return tokens;
  }

  async userLogin(dto: userLoginDto, ip: string) {
    const user = await this.userService.userLogin(dto);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.userService.updateRefreshTokenandIpAddress(
      user._id.toString(),
      tokens.refresh_token,
      ip,
    );
    return { tokens, username: user.username };
  }

  async userLogout(userId: string) {
    return this.userService.userLogout(userId);
  }

  async refreshToken(userId: string, token: string) {
    const user = await this.userService.refreshToken(userId, token);
    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.userService.updateRefreshTokenandIpAddress(
      userId,
      tokens.refresh_token,
    );
    return tokens;
  }

  async passWordReset(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user || !user.is_active || user.is_deleted)
      throw new UnauthorizedException('Email does not exist');
    const otp = this.generateOTP();
    const setOtp = await this.userService.updateOtp(email, otp);
    this.resetJob = schedule.scheduleJob(
      new Date(Date.now() + 2 * 60 * 1000),
      async () => {
        await this.userService.setOtpNull(email);
      },
    );
    if (setOtp) return await this.sendEmailOTP(email, otp);
  }

  async validateOtp(email: string, otp: string, password: string) {
    const user: any = await this.userService.getUserByEmail(email);
    const validOtp = await bcrypt.compare(otp, user.otp);
    if (!validOtp) throw new UnauthorizedException('Invalid OTP');
    await this.userService.updatePassword(email, password);
    const tokens = await this.getTokens(user._id, user.email);
    await this.userService.updateRefreshTokenandIpAddress(
      user._id,
      tokens.refresh_token,
    );
    return tokens;
  }

  async userSignUpReferal(dto: userSignUpDto, referalCode: string, ip: string) {
    const password = dto.password;
    const user = await this.userService.referalSignUp(dto, ip, referalCode);
    await this.sendEmailCredentials(
      user.userData.email,
      user.userData.username,
      password,
    );
    const tokens = await this.getTokens(
      user.userData._id.toString(),
      user.userData.email,
    );
    await this.userService.updateRefreshTokenandIpAddress(
      user.userData._id.toString(),
      tokens.refresh_token,
      ip,
    );
    await this.pointService.updateUserPoints(
      user.userData._id.toString(),
      25,
      'Referal Points',
    );
    await this.pointService.updateUserPoints(
      user.referedUser._id.toString(),
      25,
      'Referal Points',
    );
    return tokens;
  }
}
