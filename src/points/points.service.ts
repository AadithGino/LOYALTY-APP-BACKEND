import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Point } from './schema/points.schema';
import { Model } from 'mongoose';
import { TierService } from 'src/tier/tier.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { Transaction, transactionType } from 'src/transaction/schema/transaction.schema';

@Injectable()
export class PointsService {
  private readonly encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  constructor(
    @InjectModel(Point.name) private readonly pointModel: Model<Point>,
    private readonly tierService: TierService,
    private readonly transactionService: TransactionService
  ) {}

  async getUserPoints(user) {
    try {
      const pointExist: any = await this.pointModel.findOne({ user_id: user.sub });
      console.log(pointExist);
      
      if (!pointExist) {
        const newPoint: any = await this.pointModel.create({
          user_id: user.sub,
          points: this.encryptBalance(0),
        });
        newPoint.points = this.decryptBalance(newPoint.points);
        return newPoint;
      }
      pointExist.points = this.decryptBalance(pointExist.points);
      return pointExist;
    } catch (error) {
      return error;
    }
  }

  async upateUserPoints(userId: string, points: number) {
    try {
      const pointExists = await this.pointModel.findOne({ user_id: userId });

      if (pointExists) {
        const decryptedBalabce = this.decryptBalance(pointExists.points);
        const newbalance = this.encryptBalance(points + decryptedBalabce);
        await this.pointModel
          .updateOne({ user_id: userId }, { $set: { points: newbalance } })
          // .then(async (data) => {
             await this.tierService.updateTier(
              userId,
              decryptedBalabce + points,
            );
            
            await this.transactionService.addTransactionHistory({amount:points},userId,'Add Points',transactionType.Points,2)
          // });
      } else {
        const newbalance = this.encryptBalance(points);

        this.pointModel
          .create({ user_id: userId, balance: newbalance })
          // .then(async (data) => {
            return await this.tierService.updateTier(userId, points);
          // })
          // .catch((err) => console.log(err));
      }
    } catch (error) {
      return error;
    }
  }

  async getPointsHistory (user){
    const history = await this.transactionService.getHistory(user.sub)
    return history.transactions;
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
