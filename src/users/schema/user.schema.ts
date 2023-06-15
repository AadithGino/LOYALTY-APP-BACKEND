import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date } from 'mongoose';


export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum LoginMode{
  Google = 'Google',
  Facebook = 'Facebook',
  AppleId = 'AppleId',
  Password = 'Password',
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User {
  @Prop({ required: true })
  Username: string;

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
  Email: string;

  @Prop()
  Password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ type: Date })
  dob: Date;

  @Prop()
  gender: Gender;

  @Prop()
  phoneNumber: string;

  @Prop()
  place: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop({ default: 0 })
  LoyaltyPoints: number;

  @Prop({ default: 0 })
  WalletBalance: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({default:LoginMode.Password})
  loginMode:LoginMode

  @Prop()
  profileImgThumb :string;

  @Prop()
  rt_token: string;
}

export const userSchema = SchemaFactory.createForClass(User);
