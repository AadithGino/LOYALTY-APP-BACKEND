import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Wallet } from './schema/wallet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
  ) {}

  async getWalletBalance(user) {
    try {
      const wallet = await this.walletModel.findOne({ user_id: user.sub });
      if (!wallet) return await this.walletModel.create({user_id:user.sub,currency:'aed'});
      return wallet;
    } catch (error) {
      return error;
    }
  }

  async updateUserWalletBalance(
    userId: string,
    amount: number,
  ) {
    try {
      this.walletModel
        .updateOne(
          { user_id: userId },
          { $inc: { balance: amount } },
        )
        .then((data) => {
          console.log(data);
        });
    } catch (error) {
      return error;
    }
  }
}
