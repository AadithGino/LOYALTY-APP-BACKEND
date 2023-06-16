import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import Stripe from 'stripe';
import { validatePaymentDto } from './dto';


@Injectable()
export class TransactionService {
  private stripe: Stripe;

  constructor(private readonly walletService: WalletService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15',
    });
  }

  async createTransaction(amount: number): Promise<string> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      payment_method_types: ['card'],
    });
    console.log(paymentIntent);
    return paymentIntent.client_secret;
  }

  async validateTransaction(paymentData: validatePaymentDto, user: any) {
    try {
      // Perform payment validation and update wallet balance
      const paymentValidationResult = await this.validatePaymentIntent(
        paymentData,
      );

      if (paymentValidationResult.isValid) {
        const paymentIntentId = paymentData.paymentIntentId;

        const transaction = {
          transcation_id: paymentIntentId,
          amount: paymentData.amount,
          created_at: new Date(),
          transaction_type: 'Card',
        };

        await this.walletService.updateUserWalletBalance(
          user.sub,
          paymentData.amount,
          transaction,
        );

        return {
          message: 'Payment Successfull user wallet updated succsfully',
        };
      } else {
        throw new HttpException(
          'Payment validation failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Failed to process payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async validatePaymentIntent(
    paymentData: any,
  ): Promise<{ isValid: boolean }> {
    const { paymentIntentId, cardDetails } = paymentData;
    const paymentIntent = await this.retrievePaymentIntent(paymentIntentId);
    const isValid = paymentIntent.status === 'succeeded';

    return { isValid };
  }

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
}
