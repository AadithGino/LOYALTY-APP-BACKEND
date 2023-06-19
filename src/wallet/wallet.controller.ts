import { Controller, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWalletBalance(@GetUser() user:JwtPayload) {
    return this.walletService.getWalletBalance(user);
  }
}
