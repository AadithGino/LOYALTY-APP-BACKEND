import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { Reward, rewardSchema } from './schema/rewards.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reward.name, schema: rewardSchema }]),
    UsersModule
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
