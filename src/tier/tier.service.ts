import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tier } from './schema/tire.schema';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/user.schema';
import { createTierDto } from './dto/createTier.dto';
import { updateTierDto } from './dto/update.dto';

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

  async getSingleTier(tier: string) {
    return await this.tierModel.findOne({
      name: { $regex: new RegExp(tier, 'i') },
    });
  }

  async updateUserTier(userId: string, points: number) {
    const tiers: any = await this.getTiers();
    const userData = await this.userModel.findOne({_id:userId});
    const userCurrentTier = tiers.find((m)=>m.name===userData.tier)
    console.log(userCurrentTier);
    let newTier = 'Bronze';
    let newTierOrder=1;
    tiers.forEach((tier) => {
      if (points >= tier.cretieria.minPointsForTier) {
        newTier = tier.name;
        newTierOrder=tier.order;
      }
    });
    console.log(userCurrentTier.order,newTierOrder+"====>");
    if(userCurrentTier.order >= newTierOrder){
      console.log("not Updating");
      return;
    }
    console.log("Updating");
    
    return await this.userModel.updateOne(
      { _id: userId },
      { $set: { tier: newTier } },
    );
  }

  async updatTierDetails(dto: updateTierDto) {
    const details = {
      name: dto.name,
      benefits: {
        maxDiscount: dto.maxDiscount,
        moneyToBeSpend: dto.moneyToBeSpend,
        pointValue: dto.pointValue,
      },
      cretieria: { minPointsForTier: dto.minimumPointsForTier },
    };
    await this.tierModel.updateOne({ _id: dto.tierId }, { $set: details });
    return { message: 'updated successfully' };
  }
}
