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
import { Point } from 'src/points/schema/points.schema';

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

  async userSignUp(dto: userSignUpDto, referedById?: string) {
    dto.password = await bcrypt.hash(dto.password, 10);
    const country = countries.find(
      (country) => country.countryShortCode === dto.country_code,
    );
    if (!country) throw new ConflictException('Invalid Country');
    const user = await this.userModel.findOne({ email: dto.email });
    if (user) throw new ConflictException('Email already in use');
    const referralCode = await this.generateUniqueReferralCode(dto.username);

    const detiails = {
      ...dto,
      latitude: country.latitude,
      longitude: country.longitude,
      country_name: country.countryName,
      mb_code: country.phonePrefix,
      currency: country.currency,
      referral_code: referralCode,
      refered_by: referedById ? referedById : '',
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

    return { message: 'Interests updated successfully' };
  }

  async addUserInterests(dto, user: JwtPayload) {
    await this.userModel.updateOne(
      { _id: user.sub },
      { $push: { interests: dto.id } },
    );

    return { message: 'Interests updated successfully' };
  }

  async removeUserInterests(dto, user: JwtPayload) {
    await this.userModel.updateOne(
      { _id: user.sub },
      { $pull: { interests: dto.id } },
    );

    return { message: 'Interests updated successfully' };
  }

  async generateUniqueReferralCode(username: string) {
    let referralCode;
    let isUnique = false;

    while (!isUnique) {
      referralCode = await this.generateReferralCode(username);

      const existingUser = await this.userModel.findOne({
        referral_code: referralCode,
      });

      if (!existingUser) {
        isUnique = true;
      }
    }

    return referralCode;
  }

  async generateReferralCode(username: string) {
    const cleanUsername = username.toLowerCase().replace(/\s/g, '');
    const randomString = Math.random().toString(36).substring(2, 8);
    // Combine the clean username and random string to create the referral code
    const referralCode = `${cleanUsername}${randomString}`;
    return referralCode;
  }

  async referalSignUp(dto: userSignUpDto, referalCode: string) {
    const validReferalCode = await this.userModel.findOne({
      referral_code: referalCode,
    });
    if (!validReferalCode)
      throw new UnauthorizedException('Invalid referal code');
    const user = await this.userSignUp(dto, validReferalCode._id.toString());
    await this.userModel.updateOne(
      { _id: validReferalCode._id },
      { $push: { refered_users: user._id } },
    );
    return { userData: user, referedUser: validReferalCode };
  }

  async getReferedUsers(user: JwtPayload) {
    const userData = await this.userModel.findOne({ _id: user.sub });
    return await this.userModel.find({ _id: { $in: userData.refered_users } });
  }

  async updateProfilePhoto(image: Express.Multer.File, user: JwtPayload) {
     await this.userModel.updateOne(
      { _id: user.sub },
      { $set: { profile_img_thumb: image.filename } },
    );

    return {message:"Photo updated successfully"}
  }
}
