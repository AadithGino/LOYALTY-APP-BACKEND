import { Controller, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetUser } from 'src/shared/decorators';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWalletBalance(@GetUser() user) {
    return this.walletService.getWalletBalance(user);
  }
}
