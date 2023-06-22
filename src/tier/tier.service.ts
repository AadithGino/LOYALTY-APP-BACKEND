import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tier } from './schema/tire.schema';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { createTierDto } from './dto/createTier.dto';

@Injectable()
export class TierService {
  constructor(
    @InjectModel(Tier.name) private readonly tierModel: Model<Tier>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async addTier(dto: createTierDto) {
    const details = {
      name: dto.name,
      benefits: {
        maxDiscount: dto.maxDiscount,
        moneyToBeSpend: dto.moneyToBeSpend,
        pointValue: dto.pointValue,
      },
      cretieria: { minPointsForTier: dto.minimumPointsForTier },
    };
    return await this.tierModel.create(details);
  }

  async getTiers() {
    return await this.tierModel.find();
  }

  async getSingleTier(id) {
    return await this.tierModel.findOne({ _id: id });
  }

  async updateUserTier(userId: string, points: number) {
    const tiers: any = await this.getTiers();
    let newTier = 'Bronze';
    tiers.forEach((tier) => {
      if (points >= tier.cretieria.minPointsForTier) {
        console.log('Update to' + tier.name);
        newTier = tier.name;
      }
    });
    return await this.userModel.updateOne(
      { _id: userId },
      { $set: { tier: newTier } },
    );
  }

  async updatTierDetails(id, dto) {
    const details = {
      name: dto.name,
      benefits: { maxDiscount: 10 },
      cretieria: { points: 300 },
    };

    await this.tierModel.updateOne({ _id: dto.tierId }, { $set: details });
  }
}
