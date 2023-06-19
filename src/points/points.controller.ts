import { Controller, Get, Post, Query } from '@nestjs/common';
import { PointsService } from './points.service';
import { GetUser } from 'src/shared/decorators';

@Controller('points')
export class PointsController {
    constructor( private readonly pointService: PointsService){}

    @Get()
    getPoints(@GetUser() user){
        return this.pointService.getUserPoints(user)
    }


    @Get('/history')
    getPointsHistory(@GetUser() user){
        return this.pointService.getPointsHistory(user)
    }

    @Post('/add')
    addPoints(@GetUser() user){
        return this.pointService.upateUserPoints(user.sub,180)
    }
}
