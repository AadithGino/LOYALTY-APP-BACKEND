import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';

import {
  Transaction,
  TransactionItem,
  TransactionMode,
  transactionType,
} from './schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TransactionHistoryService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}


  // add transaction history
  async addTransactionHistory(
    transaction,
    userId: string,
    txn_reason: string,
    txn_type: transactionType,
    txn_mode: TransactionMode,
    status?: number,
    recieverId?: string,
  ) {
    try {
      const exists = await this.transactionModel.findOne({ user_id: userId });
      if (exists) {
        const transactiondetails: TransactionItem = {
          sender_id: userId,
          amount: transaction.amount,
          txn_reason,
          txn_type,
          txn_mode,
          status: status ? status : 1,
          receiver_id: recieverId,
          txn_date: new Date(),
        };
        const document = await this.transactionModel.findOneAndUpdate(
          { user_id: userId },
          { $push: { transactions: transactiondetails } },
          { new: true },
        );
        return document.transactions[document.transactions.length - 1];
      } else {
        const transactiondetails: TransactionItem = {
          sender_id: userId,
          amount: transaction.amount,
          status: status ? status : 1,
          txn_reason,
          txn_type,
          txn_mode,
          receiver_id: recieverId,
          txn_date: new Date(),
        };
        const document = await this.transactionModel.create({
          user_id: userId,
          transactions: transactiondetails,
        });
        return document.transactions[document.transactions.length - 1];
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // add transaction history for user to user wallet transaction
  async addTransactionHistoryForUserToUser(
    transaction,
    userId: string,
    txn_reason: string,
    txn_type: transactionType,
    txn_mode: TransactionMode,
    status?: number,
    sender_id?: string,
  ) {
    try {
      const exists = await this.transactionModel.findOne({ user_id: userId });
      if (exists) {
        const transactiondetails: TransactionItem = {
          sender_id: sender_id,
          amount: transaction.amount,
          txn_reason,
          txn_type,
          txn_mode,
          status: status ? status : 1,
          receiver_id: userId,
          txn_date: new Date(),
        };
        const document = await this.transactionModel.findOneAndUpdate(
          { user_id: userId },
          { $push: { transactions: transactiondetails } },
          { new: true },
        );
        return document.transactions[document.transactions.length - 1];
      } else {
        const transactiondetails: TransactionItem = {
          sender_id: sender_id,
          amount: transaction.amount,
          status: status ? status : 1,
          txn_reason,
          txn_type,
          txn_mode,
          receiver_id: userId,
          txn_date: new Date(),
        };
        const document = await this.transactionModel.create({
          user_id: userId,
          transactions: transactiondetails,
        });
        return document.transactions[document.transactions.length - 1];
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // to add the transaction history in the users transaction document
  async addRewardTransactionHistory(
    transaction,
    userId: string,
    txn_reason: string,
    txn_type: transactionType,
    txn_mode: TransactionMode,
    status?: number,
    rewardId?: string,
  ) {
    try {
      const exists = await this.transactionModel.findOne({ user_id: userId });
      if (exists) {
        const transactiondetails: TransactionItem = {
          sender_id: userId,
          amount: transaction.amount,
          txn_reason,
          txn_type,
          txn_mode,
          status: status ? status : 1,
          reward_id: rewardId,
          txn_date: new Date(),
        };
        const document = await this.transactionModel.findOneAndUpdate(
          { user_id: userId },
          { $push: { transactions: transactiondetails } },
          { new: true },
        );
        return document.transactions[document.transactions.length - 1];
      } else {
        const transactiondetails: TransactionItem = {
          sender_id: userId,
          amount: transaction.amount,
          status: status ? status : 1,
          txn_reason,
          txn_type,
          txn_mode,
          reward_id: rewardId,
          txn_date: new Date(),
        };
        const document = await this.transactionModel.create({
          user_id: userId,
          transactions: transactiondetails,
        });
        return document.transactions[document.transactions.length - 1];
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
