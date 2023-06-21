import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum transactionType{
  Wallet='Wallet',
  Points='Points'
}

export enum TransactionMode{
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT'
}

export interface TransactionItem {
  _id?: Types.ObjectId; // Add _id property to hold the ObjectId
  txn_id?: string;
  txn_date?: Date;
  txn_type?: string;
  txn_mode?: string;
  payment_gateway_id?: string;
  currency_id?: string;
  country_id?: string;
  sender_id: string;
  receiver_id?: string;
  amount: number;
  fees?: number;
  comments?: string;
  ecomments?: string;
  txn_reason?: string;
  status?: number;  // 0 = failed, 1 = pending, 2 = successful
  created_at?: Date;
  updated_at?: Date;
  ip_address?: string;
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Transaction {
  @Prop({ required: true, ref: 'User' })
  user_id: string;

  @Prop()
  ip_address: string;

  @Prop(
    raw([
      {
        _id: {
          type: Types.ObjectId,
          default: () => new Types.ObjectId(), // Generate new ObjectId for each object
        }, // Generate new ObjectId by default
        txn_id: { type: String },
        txn_date: { type: Date },
        txn_type: { type: String },
        txn_mode: { type: String },
        payment_gateway_id: { type: String },
        currency_id: { type: String },
        country_id: { type: String },
        sender_id: { type: String, required: true },
        receiver_id: { type: String },
        amount: { type: Number, required: true },
        fees: { type: Number },
        comments: { type: String },
        ecomments: { type: String },
        txn_reason: { type: String },
        status: { type: Number, required: true },
        created_at: { type: Date, required: true, default: Date.now },
        updated_at: { type: Date, required: true, default: Date.now },
        ip_address: { type: String },
      },
    ]),
  )
  transactions: TransactionItem[];

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;

  @Prop({default:true})
  status:boolean
}

export const transactionSchema = SchemaFactory.createForClass(Transaction);
