import { Body, Controller, Post } from '@nestjs/common';
import Stripe from 'stripe';
import { TransactionService } from './transaction.service';
import { GetUser, Public } from 'src/shared/decorators';
import { validatePaymentDto } from './dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Public()
  @Post('create-transaction')
  async createTransaction(
    @Body('amount') amount: number = 500,
    @GetUser() user: any,
  ) {
    return await this.transactionService.createTransaction(
      amount,
    );
  }

  @Post('validate-payment')
  async validateTransaction(
    @Body() paymentData: validatePaymentDto,
    @GetUser() user: any,
  ) {
    return this.transactionService.validateTransaction(paymentData, user);
  }
}
