import { Injectable, HttpException } from '@nestjs/common';
import { Wallet } from './schema/wallet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WalletService {
  private readonly encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
  ) {}

  async getWalletBalance(user) {
    const wallet: any = await this.walletModel.findOne({ user_id: user.sub });
    if (!wallet) {
      const newWallet: any = await this.walletModel.create({
        user_id: user.sub,
        currency: 'aed',
        balance: this.encryptBalance(0),
      });
      newWallet.balance = this.decryptBalance(newWallet.balance);
      return newWallet;
    }
    wallet.balance = this.decryptBalance(wallet.balance);
    return wallet;
  }

  async updateUserWalletBalance(userId: string, amount: number) {
    try {
      const wallet = await this.walletModel.findOne({ user_id: userId });

      if (wallet) {
        const decryptedBalance = this.decryptBalance(wallet.balance);
        const newbalance = this.encryptBalance(amount + decryptedBalance);
        const updatedWallet = await this.walletModel.updateOne(
          { user_id: userId },
          { $set: { balance: newbalance } },
        );
        if (updatedWallet) return true;
      } else {
        const newbalance = this.encryptBalance(amount);
        await this.walletModel.create({
          user_id: userId,
          balance: newbalance,
          currency: 'aed',
        });
        return true;
      }
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  private encryptBalance(balance: number): string {
    const key = Buffer.from(this.encryptionKey, 'utf8');
    const buffer = Buffer.allocUnsafe(8);
    buffer.writeInt32BE(balance, 0);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] ^= key[i % key.length];
    }
    return buffer.toString('base64');
  }

  private decryptBalance(encryptedBalance: string): number {
    const key = Buffer.from(this.encryptionKey, 'utf8');
    const buffer = Buffer.from(encryptedBalance, 'base64');
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] ^= key[i % key.length];
    }
    return buffer.readInt32BE(0);
  }
}
