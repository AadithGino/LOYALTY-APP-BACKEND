import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Point } from './schema/points.schema';
import { Model } from 'mongoose';
import { TierService } from 'src/tier/tier.service';
import { TransactionService } from 'src/transaction/transaction.service';
import {
  TransactionMode,
  Transaction_APP,
  transactionType,
} from 'src/transaction/schema/transaction.schema';
import { JwtPayload } from 'src/auth/stragtegies';
import { TransactionHistoryService } from 'src/transaction/transactionHistory.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { pointPurchaseDto } from './dto/pointPurchase.dto';

@Injectable()
export class PointsService {
  private readonly encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  constructor(
    @InjectModel(Point.name) private readonly pointModel: Model<Point>,
    private readonly tierService: TierService,
    private readonly transactionService: TransactionService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly userService: UsersService,
  ) {}

  async getUserPoints(user) {
    const pointExist: any = await this.pointModel.findOne({
      user_id: user.sub,
    });

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
  }

  async updateUserPoints(
    userId: string,
    points: number,
    txn_desc: string = 'Add Points',
    reward_id?: string,
  ) {
    const pointExists = await this.pointModel.findOne({ user_id: userId });

    if (pointExists) {
      const decryptedBalabce = this.decryptBalance(pointExists.points);
      const newbalance = this.encryptBalance(points + decryptedBalabce);
      const point = await this.pointModel.updateOne(
        { user_id: userId },
        { $set: { points: newbalance } },
        { new: true },
      );
      await this.tierService.updateUserTier(userId, decryptedBalabce + points);
      await this.transactionHistoryService.addTransactionHistory(
        { amount: points },
        userId,
        txn_desc,
        transactionType.Points,
        TransactionMode.DEPOSIT,
        Transaction_APP.LOYALTY_APP,
        2,
        '',
        reward_id,
      );
      return { message: 'Points added successfully' };
    } else {
      const newbalance = this.encryptBalance(points);
      const point = await this.pointModel.create({
        user_id: userId,
        points: newbalance,
      });
      await this.tierService.updateUserTier(userId, points);
      await this.transactionHistoryService.addTransactionHistory(
        { amount: points },
        userId,
        txn_desc,
        transactionType.Points,
        TransactionMode.DEPOSIT,
        Transaction_APP.LOYALTY_APP,
        2,
        '',
        reward_id,
      );
      return { message: 'Points added successfully' };
    }
  }
  
  async pointPurchase(dto:pointPurchaseDto, user: JwtPayload) {
     const userData = await this.userService.getUserById(user.sub)
    const validPassword = await bcrypt.compare(dto.password,userData.password)
    if(!validPassword) throw new UnauthorizedException("Invalid Password")
    const balance = await this.getUserPoints(user);
    if (balance.balance < dto.amount)
      throw new ConflictException('Not enough balance');
    await this.updateUserPointsNoHistory(user.sub, 0 - dto.amount);
    await this.transactionHistoryService.addTransactionHistory(
      { amount: dto.amount },
      user.sub,
      dto.reason,
      transactionType.Points,
      TransactionMode.WITHDRAWAL,
      dto.transaction_app,
      2,
    );
    return { message: 'Transaction Successfull' };
  }

  async getPointsHistory(user: JwtPayload) {
    const history = await this.transactionService.getHistory(user.sub);
    if (history?.transactions) return history.transactions;
    return [];
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

  async updateUserPointsNoHistory(userId: string,points: number){
    const pointExists = await this.pointModel.findOne({ user_id: userId });
    if (pointExists) {
      const decryptedBalabce = this.decryptBalance(pointExists.points);
      const newbalance = this.encryptBalance(points + decryptedBalabce);
      const point = await this.pointModel.updateOne(
        { user_id: userId },
        { $set: { points: newbalance } },
        { new: true },
      );
      await this.tierService.updateUserTier(userId, decryptedBalabce + points);
      return { message: 'Points added successfully' };
    } else {
      const newbalance = this.encryptBalance(points);
      const point = await this.pointModel.create({
        user_id: userId,
        points: newbalance,
      });
      await this.tierService.updateUserTier(userId, points);
      return { message: 'Points added successfully' };
    }
  }
}
