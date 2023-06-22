import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import Stripe from 'stripe';
import { validatePaymentDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionItem,
  TransactionMode,
  transactionType,
} from './schema/transaction.schema';
import { Model } from 'mongoose';
import { JwtPayload } from 'src/auth/stragtegies';

@Injectable()
export class TransactionService {
  private stripe: Stripe;

  constructor(
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  // to create a new transaction and
  async createTransaction(
    amount: number,
    userId: string,
    currency: string,
    txn_reason: string,
    sender_id?: string,
  ): Promise<any> {
    console.log(amount, userId, currency);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      payment_method_types: ['card'],
    });

    const transaction = await this.addTransactionHistory(
      { amount },
      userId,
      txn_reason,
      transactionType.Wallet,
      TransactionMode.DEPOSIT,
    );
    return {
      transaction_id: transaction._id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  // validate the transaction with transaction id and paymentIntent
  async validateTransaction(paymentData: validatePaymentDto, user: any) {
    const paymentValidationResult = await this.validatePaymentIntent(
      paymentData,
    );

    if (paymentValidationResult.isValid) {
      const paymentIntentId = paymentData.paymentIntentId;
      const transactionHistory = await this.updateSuccessTransactionHistory(
        user.sub,
        paymentData.transactionId,
        2,
        paymentIntentId,
      );

      await this.walletService.updateUserWalletBalance(
        user.sub,
        transactionHistory.amount,
      );

      return {
        message: 'Payment Successfull user wallet updated succsfully',
      };
    } else {
      await this.updateFailureTransactionHistory(
        user.sub,
        paymentData.transactionId,
        paymentData.comment,
      );
      throw new HttpException(
        'Payment validation failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // validating the paymentIntent
  private async validatePaymentIntent(
    paymentData: any,
  ): Promise<{ isValid: boolean }> {
    const { paymentIntentId } = paymentData;
    const transactionExists = await this.validateTransactionId(paymentIntentId);
    if (!transactionExists)
      throw new ConflictException('This payment already exists');
    const paymentIntent = await this.retrievePaymentIntent(paymentIntentId);
    const isValid = paymentIntent.status === 'succeeded';

    return { isValid };
  }

  // to retrieve the paymentIntent status from stripe
  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId,
      );
      return paymentIntent;
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  // to add the transaction history in the users transaction document
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

  // to check whether the paymentIndent has been already used or not
  async validateTransactionId(transactionId: string) {
    try {
      const result = await this.transactionModel.findOne({
        transactions: { $elemMatch: { txn_id: transactionId } },
      });
      if (result)
        throw new HttpException('Payment with this id already used', 400);
      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException('Payment with this id already used', 400);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  // to update the success transaction
  async updateSuccessTransactionHistory(
    userId: string,
    transactionId: string,
    status: number,
    paymentId: string,
  ) {
    const updatedDocument = await this.transactionModel
      .findOneAndUpdate(
        { user_id: userId, 'transactions._id': transactionId },
        {
          $set: {
            'transactions.$.txn_id': paymentId,
            'transactions.$.status': status,
            'transactions.$.txn_type': 'card',
            'transactions.$.comments': 'Payment SuccessFull',
            'transactions.$.txn_date': new Date(),
          },
        },
        { new: true },
      )
      .lean();
    if (!updatedDocument?.transactions) throw new UnauthorizedException();
    return updatedDocument.transactions.find(
      (item) => item.txn_id === paymentId,
    );
  }

  // to update the failed transaction
  async updateFailureTransactionHistory(
    userId: string,
    transactionId: string,
    comment: string,
  ) {
    const updatedDocument = await this.transactionModel
      .findOneAndUpdate(
        { user_id: userId, 'transactions._id': transactionId },
        {
          $set: {
            'transactions.$.status': 0,
            'transactions.$.comments': comment,
            'transactions.$.txn_type': 'card',
            'transactions.$.txn_date': new Date(),
          },
        },
        { new: true },
      )
      .lean();
    return updatedDocument.transactions.find(
      (transaction) => transaction.txn_id === transactionId,
    );
  }

  async getHistory(userId) {
    return await this.transactionModel.findOne({ user_id: userId });
  }

  async getPassport(user: JwtPayload) {
    const history = await this.getHistory(user.sub);
    const wallet_balance = await this.walletService.getWalletBalance(user);
    return {
      history: history?.transactions ? history.transactions : [],
      wallet_balance: wallet_balance.balance,
      currency: wallet_balance.currency,
    };
  }
}
