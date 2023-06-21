import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Wallet {
  @Prop({ required: true,ref:'User'})
  user_id: string;

  @Prop()
  walletId: string;

  @Prop({ required: true })
  balance: string;

  @Prop({ required: true })
  currency: string;

  @Prop({default:true})
  status:boolean

}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

