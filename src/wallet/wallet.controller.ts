import { Body, Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';
import {
  createFriendPaymnetDto,
  createPaymnetDto,
  walletRechargeFromWalletDto,
} from './dto';

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

  // @Post('/create-friend-wallet-recharge-request')
  // async createFriendWalletRechargeRequest(@Body() dto: createFriendPaymnetDto) {
  //   return await this.walletService.createFriendWalletRechargeRequest(dto);
  // }

  // @Post('/validate-friend-wallet-recharge')
  // async validateFriendWalletRechargeRequest(
  //   @Body() dto,
  //   @GetUser() user: JwtPayload,
  // ) {
  //   return await this.walletService.validateFriendsWalletRechargeRequest(
  //     dto,
  //     dto.user_id,
  //   );
  // }

  @Post('/friend-wallet-recharge')
  async friendWalletRecharge(
    @Body() dto: walletRechargeFromWalletDto,
    @GetUser() user,
  ) {
    return await this.walletService.rechargeFriendWalletFromWallet(dto, user);
  }
}
