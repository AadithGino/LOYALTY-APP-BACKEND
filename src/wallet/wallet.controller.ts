import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWalletBalance(@GetUser() user: JwtPayload) {
    return this.walletService.getWalletBalance(user);
  }

  @Post('/create-wallet-recharge')
  async createWalletRechargeRequest(@Body() dto, @GetUser() user: JwtPayload) {
    return await this.walletService.createWalletRechargeRequest(dto, user);
  }

  @Post('/validate-wallet-recharge')
  async validateWalletRechargeRequest(@Body() dto,@GetUser() user: JwtPayload) {
    return await this.walletService.validateWalletRechargeRequest(dto, user);
  }
}
