import { Controller, Get, Post, Query } from '@nestjs/common';
import { PointsService } from './points.service';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

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
}
