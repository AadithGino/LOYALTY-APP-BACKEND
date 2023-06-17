import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { userLoginDto, userSignUpDto } from 'src/auth/dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  async userLogin(dto: userLoginDto) {
    const result = await this.userModel.findOne({ email: dto.email });
    if (!result || !result.is_active || result.is_deleted)
      throw new UnauthorizedException('Invalid Email and/or Password');

    const validPassword = await bcrypt.compare(dto.password, result.password);
    if (!validPassword)
      throw new UnauthorizedException('Invalid Email and/or Password');
    
    return result;
  }

  async userSignUp(dto: userSignUpDto) {
    dto.password = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.findOne({ email: dto.email });
    if(user) throw new ConflictException("email already in use")
    return await this.userModel.create(dto);
  }

  // updating the refresh token with the new hashed token

  async updateRefreshToken(userId: string, refreshToken: string) {
    const newrefreshToken = refreshToken.slice(172);
    const rt = await bcrypt.hash(newrefreshToken, 10);
    return await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { rt_token: rt } },
    );
  }

  //user logout service , setting null for refresh token in db

  async userLogout(userId: string) {
    return await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { rt_token: null } },
    );
  }

  // Refresh token service comparing the refresh token with the hashed token

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user || !user.is_active || user.is_deleted)
      throw new UnauthorizedException();
    if (user.rt_token === null) throw new UnauthorizedException('Acced denied');
    const newrefreshToken = refreshToken.slice(172);
    const refreshTokenValid = await bcrypt.compare(
      newrefreshToken,
      user.rt_token,
    );
    if (!refreshTokenValid) throw new UnauthorizedException('Acced denied');
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email });
  }

  async updateOtp(email: string, otp: string) {
    const newOtp = await bcrypt.hash(otp, 10);
    return this.userModel.updateOne(
      { email: email },
      {
        $set: {
          otp: newOtp,
          expirationTime: new Date(Date.now() + 2 * 60 * 1000),
        },
      },
    );
  }

  async compareOtp(email: string, otp: string) {
    const user = await this.userModel.findOne({ email: email });
    const validOtp = await bcrypt.compare(otp, user.otp);
    if (validOtp) return user;
    return false;
  }

  async updatePassword(email: string, password: string) {
    const newPassword = await bcrypt.hash(password, 10);
    return this.userModel.updateOne(
      { email: email },
      { $set: { password: newPassword } },
    );
  }

  async setOtpNull(email: string) {
    this.userModel
      .updateOne({ email: email }, { $set: { otp: null } })
      .then((data) => {
        console.log(data);
        console.log('Otp status changed');
      });
  }
}
