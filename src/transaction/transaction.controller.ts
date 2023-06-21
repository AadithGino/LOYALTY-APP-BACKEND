import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { GetUser, Public } from 'src/shared/decorators';
import { validatePaymentDto } from './dto';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/passport')
  getPassport(@GetUser() user:JwtPayload){
    return this.transactionService.getPassport(user)
  }
}
