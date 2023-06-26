import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';
import { createPaymnetDto, walletRechargeFromWalletDto } from './dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWalletBalance(@GetUser() user: JwtPayload) {
    return this.walletService.getWalletBalance(user);
  }

  @Post('/create-wallet-recharge')
  async createWalletRechargeRequest(
    @Body() dto: createPaymnetDto,
    @GetUser() user: JwtPayload,
  ) {
    return await this.walletService.createWalletRechargeRequest(dto, user);
  }

  @Post('/validate-wallet-recharge')
  async validateWalletRechargeRequest(
    @Body() dto,
    @GetUser() user: JwtPayload,
  ) {
    return await this.walletService.validateWalletRechargeRequest(dto, user);
  }

  @Post('/friend-wallet-recharge')
  async friendWalletRecharge(
    @Body() dto: walletRechargeFromWalletDto,
    @GetUser() user,
  ) {
    return await this.walletService.rechargeFriendWalletFromWallet(dto, user);
  }
}
