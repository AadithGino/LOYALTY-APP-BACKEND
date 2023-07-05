import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RoleGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from 'src/users/schema/user.schema';
import { createRewardDto, updateRewardDto } from './dto';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardService: RewardsService) {}


  @Get()
  getRewards() {
    return this.rewardService.getRewards();
  }

  @Post('/claim-reward')
  claimReward(@Body() dto,@GetUser() user:JwtPayload){
    return this.rewardService.claimReward(dto,user)
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Get('/all-rewards')
  getAllRewards() {
    return this.rewardService.getAllRewards()
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  addReward(@Body() dto: createRewardDto) {
    return this.rewardService.addReward(dto);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Put()
  updateReward(@Body() dto: updateRewardDto) {
    return this.rewardService.updateReward(dto);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Delete()
  deleteReward(@Body('id') id) {
    return this.rewardService.deleteReward(id);
  }
}
