import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date } from 'mongoose';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export enum LoginMode {
  Google = 'Google',
  Facebook = 'Facebook',
  AppleId = 'AppleId',
  Password = 'Password',
}

export enum UserRoles {
  ADMIN = 'Admin',
  USER = 'User',
  VENDOR = 'Vendor',
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})

export class User {
  @Prop({ required: true })
  username: string;

  @Prop({
    unique: true,
    required: true,
    trim: true,
    validator: {
      validator: (v) => {
        return /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/.test(v);
      },
      message: () => 'Please type a valid email id!',
    },
  })
  email: string;

  @Prop()
  password: string;

  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ type: Date })
  dob: Date;

  @Prop()
  gender: Gender;

  @Prop()
  phone_number: string;

  @Prop()
  place: string;

  @Prop({ default: 'Bronze' })
  tier: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({ default: 0 })
  loyalty_points: number;

  @Prop()
  country_code: string;

  @Prop()
  country_name: string;

  @Prop()
  mb_code: string;

  @Prop()
  currency: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: LoginMode.Password })
  login_mode: LoginMode;

  @Prop()
  profile_img_thumb: string;

  @Prop({ default: null, expires: 0 })
  otp: string;

  @Prop({default:UserRoles.USER})
  roles:string;

  @Prop()
  rt_token: string;
}

export const userSchema = SchemaFactory.createForClass(User);
