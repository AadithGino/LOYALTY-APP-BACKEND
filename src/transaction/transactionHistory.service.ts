import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';

import {
  Transaction,
  TransactionItem,
  TransactionMode,
  Transaction_APP,
  transactionType,
} from './schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { JwtPayload } from 'src/auth/stragtegies';

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
    transaction_app: string,
    status?: number,
    receiver_id?: string,
    reward_id?: string,
  ) {
    try {
      const exists = await this.transactionModel.findOne({ user_id: userId });
      if (exists) {
        const transactiondetails: TransactionItem = {
          sender_id: userId,
          amount: transaction.amount,
          txn_reason,
          txn_type,
          receiver_id,
          txn_mode,
          status: status ? status : 1,
          reward_id: reward_id,
          txn_date: new Date(),
          txn_app: transaction_app,
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
          receiver_id,
          txn_mode,
          reward_id: reward_id,
          txn_date: new Date(),
          txn_app: transaction_app,
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
    transaction_app: string,
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
          txn_app: transaction_app,
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
          txn_app: transaction_app,
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
    transaction_app: string,
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
          txn_app: transaction_app,
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
          txn_app: transaction_app,
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

  async getPassport(
    user: JwtPayload,
    start: string,
    end: string,
    app: string,
    page: number,
    limit: string,
  ) {
    try {
      let pageSize = parseInt(limit);

      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      const transaction = await this.transactionModel.aggregate([
        { $match: { user_id: user.sub } },
        {
          $project: {
            transactions: {
              $filter: {
                input: '$transactions',
                as: 'transaction',
                cond: {
                  $and: [
                    { $gte: ['$$transaction.created_at', startDate] },
                    { $lte: ['$$transaction.created_at', endDate] },
                    app ? { $eq: ['$$transaction.txn_app', app] } : '',
                  ],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalCount: { $sum: { $size: '$transactions' } },
            paginatedTransactions: { $push: '$transactions' },
          },
        },
        {
          $project: {
            _id: 0,
            totalCount: 1,
            paginatedTransactions: {
              $reduce: {
                input: '$paginatedTransactions',
                initialValue: [],
                in: { $concatArrays: ['$$value', '$$this'] },
              },
            },
          },
        },
        {
          $project: {
            totalCount: 1,
            paginatedTransactions: {
              $slice: [
                '$paginatedTransactions',
                (page - 1) * pageSize,
                pageSize,
              ],
            },
          },
        },
      ]);

      if (transaction.length < 1) {
        return { history: [] };
      }
      return {
        history: transaction[0].paginatedTransactions,
        totalCount: transaction[0].totalCount,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async addFailureTransactionHistory(
    amount: number,
    userId: string,
    txn_reason: string,
    txn_type: transactionType,
    txn_mode: TransactionMode,
    transaction_app: string,
    comment: string,
  ) {
    try {
      const exists = await this.transactionModel.findOne({ user_id: userId });
      if (exists) {
        const transactiondetails: TransactionItem = {
          sender_id: userId,
          amount: amount,
          txn_reason,
          txn_type,
          txn_mode,
          status: 0,
          txn_date: new Date(),
          txn_app: transaction_app,
          comments: comment,
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
          amount: amount,
          txn_reason,
          txn_type,
          txn_mode,
          status: 0,
          txn_date: new Date(),
          txn_app: transaction_app,
          comments: comment,
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
