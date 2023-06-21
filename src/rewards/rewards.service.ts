import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reward } from './schema/rewards.schema';
import { Model } from 'mongoose';
import { createRewardDto, updateRewardDto } from './dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
  ) {}

  async getRewards() {
    return await this.rewardModel.find();
  }

  async addReward(dto:createRewardDto) {
    return await this.rewardModel.create(dto);
  }

  async updateReward(dto:updateRewardDto){
    return await this.rewardModel.updateOne({_id:dto._id},{$set:dto})
  }
  
  async deleteReward(dto){
    return await this.rewardModel.deleteOne({_id:dto.id})
  }
}
