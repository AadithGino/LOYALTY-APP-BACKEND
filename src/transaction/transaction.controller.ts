import { Controller, Get,Body,Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { GetUser, Public } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/passbook')
  getPassport(@GetUser() user: JwtPayload) {
    return this.transactionService.getPassport(user);
  }

  // @Public()
  // @Post('/create-emi')
  // createemi(@Body() body){
  //   return this.transactionService.createMonthlyEMISubscription()
  // }
}
