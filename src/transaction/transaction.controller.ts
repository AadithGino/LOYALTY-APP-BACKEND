import { Controller, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { GetUser} from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/passbook')
  getPassport(@GetUser() user:JwtPayload){
    return this.transactionService.getPassport(user)
  }
}
