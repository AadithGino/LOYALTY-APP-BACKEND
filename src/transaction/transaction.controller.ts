import { Controller, Get, Body, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { GetUser, Public } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';
import { Transaction_APP } from './schema/transaction.schema';
import { TransactionHistoryService } from './transactionHistory.service';
import { createPaymentDto, validatePaymentDto } from './dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {}

  @Get('/passbook')
  getPassport(
    @GetUser() user: JwtPayload,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('page') page,
    @Query('limit') limit,
    @Query('app') app: string,
  ) {
    return this.transactionHistoryService.getPassport(
      user,
      start,
      end,
      app,
      page,
      limit,
    );
  }

  @Post('/create-payment-request')
  createPaymentRequest(@Body() dto:createPaymentDto, @GetUser() user:JwtPayload) {
    return this.transactionService.createPaymentRequest(dto, user);
  }

  @Post('/validate-payment-request')
  validatePaymentRequest(@Body() dto:validatePaymentDto, @GetUser() user:JwtPayload) {
    return this.transactionService.validateTransaction(dto, user,false);
  }
}
