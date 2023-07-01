import { Controller, Get, Body, Post,Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { GetUser, Public } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';
import { Transaction_APP } from './schema/transaction.schema';


@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/passbook')
  getPassport(
    @GetUser() user: JwtPayload,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('page') page,
    @Query('limit') limit,
    @Query('app') app: string,
  ) {
    return this.transactionService.getPassport(user,start,end,Transaction_APP.LOYALTY_APP,page,limit);
  }

  // @Public()
  // @Post('/create-emi')
  // createemi(@Body() body){
  //   return this.transactionService.createMonthlyEMISubscription()
  // }
}
