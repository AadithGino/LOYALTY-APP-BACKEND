import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Types } from 'mongoose';

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

  @Prop()
  card_number: string;

  @Prop({ default: 'Bronze' })
  tier: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  country_code: string;

  @Prop()
  country_name: string;

  @Prop()
  mb_code: string;

  @Prop()
  currency: string;

  @Prop({ default: false })
  is_active: boolean;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: LoginMode.Password })
  login_mode: LoginMode;

  @Prop({})
  referral_code:string;

  @Prop({ref:"USER"})
  refered_by : Types.ObjectId

  @Prop()
  refered_users:[]

  @Prop()
  profile_img_thumb: string;

  @Prop({ default: null, expires: 0 })
  otp: string;

  @Prop()
  interests: [];

  @Prop({ default: UserRoles.USER })
  roles: string;

  @Prop()
  rt_token: string;

  @Prop()
  ip_address: string;

  @Prop()
  first_ip_address: string;
}

export const userSchema = SchemaFactory.createForClass(User);
