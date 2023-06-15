import {
  ForbiddenException,
  HttpException,
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
  ) {}

  async userLogin(dto: userLoginDto) {
    const result = await this.userModel.findOne({ Email: dto.Email });
    if (!result)
      throw new UnauthorizedException('Invalid Email and/or Password');

    const validPassword = await bcrypt.compare(dto.Password, result.Password);
    if (!validPassword)
      throw new UnauthorizedException('Invalid Email and/or Password');

    return result;
  }

  async userSignUp(dto: userSignUpDto) {
    try {
      dto.Password = await bcrypt.hash(dto.Password, 10);
      return await this.userModel.create(dto);
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  // updating the refresh token with the new hashed token

  async updateRefreshToken(userId: string, refreshToken: string) {
    const rt = await bcrypt.hash(refreshToken, 10);
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
    if (!user) throw new UnauthorizedException();
    if (user.rt_token === null) throw new ForbiddenException('Acced denied');
    const refreshTokenValid = await bcrypt.compare(refreshToken, user.rt_token);
    if (!refreshTokenValid) throw new ForbiddenException('Acced denied');
    return user;
  }
}
