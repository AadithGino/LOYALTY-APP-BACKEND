import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException
} from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import Stripe from 'stripe';
import { validatePaymentDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionItem,transactionType } from './schema/transaction.schema';
import { Model } from 'mongoose';

@Injectable()
export class TransactionService {
  private stripe: Stripe;

  constructor(
    private readonly walletService: WalletService,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  // to create a new transaction and
  async createTransaction(amount: number): Promise<any> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      payment_method_types: ['card'],
    });
    const transaction = await this.addTransactionHistory(
      { amount },
      '648d4c60722311bee7aa2a93',
      'Wallet Recharge',
      transactionType.Wallet
    );
    return {
      transaction_id: transaction._id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  // validate the transaction with transaction id and paymentIntent
  async validateTransaction(paymentData: validatePaymentDto, user: any) {
    // try {
      // Perform payment validation and update wallet balance
      const paymentValidationResult = await this.validatePaymentIntent(
        paymentData,
      );

      if (paymentValidationResult.isValid) {
        const paymentIntentId = paymentData.paymentIntentId;
       const transactionHistory =  await this.updateSuccessTransactionHistory(
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
    // } catch (error) {
      await this.updateFailureTransactionHistory(
        user.sub,
        paymentData.transactionId,
        paymentData.comment,
      );
      throw new HttpException(
        'Failed to process payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    // }
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
  async addTransactionHistory(transaction, userId:string, txn_reason:string,txn_type:transactionType,status?:number){
    try {
      const exists = await this.transactionModel.findOne({ user_id: userId });
      if (exists) {
        const transactiondetails: TransactionItem = {
          sender_id: userId,
          amount: transaction.amount,
          status: status?status:1,
          txn_reason,
          txn_type
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
          status: 1,
          txn_reason
        };
        const document = await this.transactionModel.create({
          user_id: userId,
          transactions: transactiondetails,
        });
        return document.transactions[document.transactions.length - 1];
      }
    } catch (error) {
      throw new InternalServerErrorException();
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
      const updatedDocument = await this.transactionModel.findOneAndUpdate(
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
      ).lean();
      if(!updatedDocument?.transactions) throw new UnauthorizedException()
      return updatedDocument.transactions.find((item)=>item.txn_id===paymentId)
  }

  // to update the failed transaction
  async updateFailureTransactionHistory(
    userId: string,
    transactionId: string,
    comment: string,
  ) {
      const updatedDocument = await this.transactionModel.findOneAndUpdate(
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
      ).lean();
      return updatedDocument.transactions.find((transaction)=>transaction.txn_id===transactionId);
  }

  async getHistory(userId){
    return this.transactionModel.findOne({user_id:userId})
  }
}
