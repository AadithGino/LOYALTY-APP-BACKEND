import { Controller, Get, Post, Body } from '@nestjs/common';
import { PointsService } from './points.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';
import { pointPurchaseDto } from './dto/pointPurchase.dto';

@Controller('points')
export class PointsController {
  constructor(private readonly pointService: PointsService) {}

  @Get()
  getPoints(@GetUser() user: JwtPayload) {
    return this.pointService.getUserPoints(user);
  }

  @Get('/history')
  getPointsHistory(@GetUser() user: JwtPayload) {
    return this.pointService.getPointsHistory(user);
  }

  @Post('/add')
  addPoints(@GetUser() user: JwtPayload) {
    return this.pointService.updateUserPoints(user.sub, 100);
  }

  @Post('/point-purchase')
  pointPurchase(@Body() dto: pointPurchaseDto, @GetUser() user: JwtPayload) {
    return this.pointService.pointPurchase(dto, user);
  }

  // @Post('/point-redeem')
  // pointRedeem(@Body('amount') amount: number, @GetUser() user: JwtPayload) {
  //   return this.pointService.redeemPointsToWallet(amount, user);
  // }
}
