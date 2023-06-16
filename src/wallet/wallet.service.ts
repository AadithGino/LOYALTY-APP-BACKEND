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
      const wallet = await this.walletModel.findOne({ userId: user.sub });
      if (!wallet) throw new UnauthorizedException();
      return wallet;
    } catch (error) {
      return error;
    }
  }

  async updateUserWalletBalance(
    userId: string,
    amount: number,
    transaction: any,
  ) {
    try {
      this.walletModel
        .updateOne(
          { userId: userId },
          { $inc: { balance: amount }, $push: { transactions: transaction } },
        )
        .then((data) => {
          console.log(data);
        });
    } catch (error) {
      return error;
    }
  }
}
