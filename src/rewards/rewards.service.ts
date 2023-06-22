import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reward } from './schema/rewards.schema';
import { Model } from 'mongoose';
import { createRewardDto, updateRewardDto } from './dto';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  TransactionMode,
  transactionType,
} from 'src/transaction/schema/transaction.schema';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    private readonly transactionService: TransactionService,
  ) {}

  async getRewards() {
    return await this.rewardModel.find();
  }

  async addReward(dto: createRewardDto) {
    return await this.rewardModel.create(dto);
  }

  async updateReward(dto: updateRewardDto) {
    await this.rewardModel.updateOne({ _id: dto._id }, { $set: dto });
    return { message: 'Successfully updated' };
  }

  async deleteReward(dto) {
    await this.rewardModel.deleteOne({ _id: dto.id });
    return { message: 'Successfully deleted' };
  }

  async claimReward(dto, user) {
    const reward = await this.rewardModel.findOne({ _id: dto.id });
    const points = reward.points_on_completion;
    await this.transactionService.addRewardTransactionHistory(
      { amount: points },
      user.sub,
      'Claimed Points from rewards',
      transactionType.Points,
      TransactionMode.DEPOSIT,
      2,
      reward._id.toString(),
    );
  }
}
