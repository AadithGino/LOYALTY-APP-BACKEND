import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  Inject,
  BadRequestException,
  forwardRef,
} from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import Stripe from 'stripe';
import { validatePaymentDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionMode,
  transactionType,
} from './schema/transaction.schema';
import { Model } from 'mongoose';
import { JwtPayload } from 'src/auth/stragtegies';
import { TransactionHistoryService } from './transactionHistory.service';

@Injectable()
export class TransactionService {
  private stripe: Stripe;

  constructor(
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly transactionHistoryService: TransactionHistoryService,
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
    email: string,
  ): Promise<any> {
    // Check if the user's email exists in Stripe
    let customer;
    const existingCustomers = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });
    if (existingCustomers.data.length > 0) {
      // Retrieve the existing customer
      customer = existingCustomers.data[0];
    } else {
      // Create a new customer in Stripe
      customer = await this.stripe.customers.create({
        email: email,
        // Add any additional customer information as required
      });
    }

    // Create a payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      customer: customer.id,
      payment_method_types: ['card'],
    });

    // Create a transaction history
    const transaction =
      await this.transactionHistoryService.addTransactionHistory(
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
  async validateTransaction(paymentData: validatePaymentDto, user: JwtPayload) {
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
            'transactions.$.txn_type': transactionType.Wallet,
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
            'transactions.$.txn_type': transactionType.Wallet,
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

  // async createMonthlyEMISubscription(
  //   email?: '2004aadith@gmail.com',
  //   amount?: 200,
  //   installments?: 5,
  //   currency?: 'inr',
  // ) {
  //   // try {
  //   //   // Create a custom plan with the desired amount and interval
  //   //   const plan = await this.stripe.plans.create({
  //   //     amount: 10000,
  //   //     currency: 'inr',
  //   //     interval: 'month',
  //   //     interval_count: 2,
  //   //     product: {
  //   //       name: `EMI Plan (${installments} months)`,
  //   //     },
  //   //   });

  //   //   console.log(plan);

  //   //   // Create a subscription
  //   //   const subscription = await this.stripe.subscriptions.create({
  //   //     customer: await this.getCustomerIdByEmail(email),
  //   //     items: [
  //   //       {
  //   //         plan: plan.id,
  //   //       },
  //   //     ],
  //   //   });

  //   //   // Check if the subscription creation was successful
  //   //   if (!subscription || subscription.status !== 'active') {
  //   //     throw new BadRequestException('Subscription creation failed');
  //   //   }

  //   //   return plan;
  //   // } catch (error) {
  //   //   console.log(error);
  //   // }
  //   const customer = await this.getCustomerIdByEmail("2004aadith@gmail.com");
  //   console.log(customer);
    
  //   const paymentId = await this.getPaymentMethodId(customer)
  //   console.log(paymentId);
    
  // }

  // async getCustomerIdByEmail(email: string): Promise<string> {
  //   const customers = await this.stripe.customers.list({
  //     email,
  //     limit: 1,
  //   });

  //   if (customers.data.length > 0) {
  //     return customers.data[0].id; // Return the existing customer ID
  //   }

  //   // Create a new customer
  //   const newCustomer = await this.stripe.customers.create({
  //     email,
  //   });

  //   if (!newCustomer || !newCustomer.id) {
  //     throw new BadRequestException('Failed to create a new customer');
  //   }

  //   return newCustomer.id;
  // }

  // async getPaymentMethodId(customerId: string): Promise<string | null> {
  //   try {
  //     const paymentMethods = await this.stripe.paymentMethods.list({
  //       customer: customerId,
  //       type: 'card_present',
  //     });
  //     console.log(paymentMethods);
      
  //     if (paymentMethods.data.length > 0) {
  //       // Assuming you want to retrieve the first card payment method
  //       return paymentMethods.data[0].id;
  //     }

  //     return null; // No payment method found
  //   } catch (error) {
  //     throw new BadRequestException('Failed to retrieve payment method');
  //   }
  // }

  // async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
  //   try {
  //     await this.stripe.customers.update(customerId, {
  //       invoice_settings: {
  //         default_payment_method: paymentMethodId,
  //       },
  //     });
  //   } catch (error) {
  //     throw new BadRequestException('Failed to set default payment method');
  //   }
  // }
}
