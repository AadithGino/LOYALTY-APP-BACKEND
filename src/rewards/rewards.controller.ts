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
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';
import { RoleGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from 'src/users/schema/user.schema';
import { createRewardDto, updateRewardDto } from './dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardService: RewardsService) {}

  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(RoleGuard)
  @Get()
  getRewards() {
    return this.rewardService.getRewards();
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  addReward(@Body() dto:createRewardDto) {
    return this.rewardService.addReward(dto);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Put()
  updateReward(@Body() dto:updateRewardDto) {
    return this.rewardService.updateReward(dto);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Delete()
  deleteReward(@Body() dto) {
    return this.rewardService.deleteReward(dto);
  }
}
