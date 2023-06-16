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
  userId: string;

  @Prop()
  walletId: string;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ required: true })
  currency: string;

}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

