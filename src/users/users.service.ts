import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import * as countries from '../shared/constants/country.json';
import { userLoginDto, userSignUpDto } from 'src/auth/dto';
import { updateUserProfileDto } from './dto';
import { JwtPayload } from 'src/auth/stragtegies';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async userLogin(dto: userLoginDto) {
    const result = await this.userModel.findOne({ email: dto.email });
    if (!result || !result.is_active || result.is_deleted)
      throw new UnauthorizedException('Invalid Email');

    const validPassword = await bcrypt.compare(dto.password, result.password);
    if (!validPassword) throw new UnauthorizedException('Invalid Password');

    return result;
  }

  async userSignUp(dto: userSignUpDto) {
    dto.password = await bcrypt.hash(dto.password, 10);
    const country = countries.find(
      (country) => country.shortCode === dto.country_code,
    );
    if (!country) throw new ConflictException('Invalid Country');
    const user = await this.userModel.findOne({ email: dto.email });
    if (user) throw new ConflictException('Email already in use');
    const detiails = {
      ...dto,
      latitude: country.latitude,
      longitude: country.longitude,
      country_name: country.name,
      mb_code: country.phonePrefix,
      currency: country.currency,
    };
    return await this.userModel.create(detiails);
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
    const data = await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $set: { rt_token: null } },
    );
    if (data) return { message: 'User Successfully Loged Out' };
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

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id });
    return user;
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
    return await this.userModel.updateOne(
      { email: email },
      { $set: { password: newPassword } },
    );
  }

  async setOtpNull(email: string) {
    await this.userModel.updateOne({ email: email }, { $set: { otp: null } });
  }

  async updateProfile(dto: updateUserProfileDto, user: JwtPayload) {
    const updatedUser = await this.userModel.updateOne(
      { _id: user.sub },
      { $set: dto },
    );
    return { message: 'User profile updated successfully' };
  }

  async getAllUsers() {
    return await this.userModel.find();
  }

  async updateUserPassword(dto, user: JwtPayload) {
    const userData = await this.userModel.findOne({ _id: user.sub });
    const validPassword = await bcrypt.compare(
      dto.oldPassword,
      userData.password,
    );
    if (!validPassword) throw new UnauthorizedException('Invalid Password');
    await this.updatePassword(userData.email, dto.newPassword);
    return { message: 'password updated successfully' };
  }

  async updateUserIntererst(dto, user: JwtPayload) {
    await this.userModel.updateOne(
      { _id: user.sub },
      { $set: { interests: dto.interests } },
    );
  }

  async addUserInterests(dto, user: JwtPayload) {
    return await this.userModel.updateOne(
      { _id: user.sub },
      { $push: { interests: dto.id } },
    );
  }

  async removeUserInterests(dto, user: JwtPayload) {
    return await this.userModel.updateOne(
      { _id: user.sub },
      { $pull: { interests: dto.id } },
    );
  }
}
