import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class PointsService {
  private readonly encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  private readonly API_KEY = '8bb706497d816016a4d41b2db67a5f6c';

  constructor(
    @InjectModel(Point.name) private readonly pointModel: Model<Point>,
    private readonly tierService: TierService,
    private readonly transactionService: TransactionService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly userService: UsersService,
    private readonly walletService: WalletService,
  ) {}

  async getUserPoints(user: JwtPayload) {
    try {
      const pointExist: any = await this.pointModel
        .findOne({
          user_id: user.sub,
        })
        .lean();
      if (!pointExist) {
        const newPoint: any = await this.pointModel.create({
          user_id: user.sub,
          points: this.encryptBalance(0),
          // redeemed_points: this.encryptBalance(0),
        });
        newPoint.points = this.decryptBalance(newPoint.points);
        // newPoint.redeemed_points = this.decryptBalance(
        //   newPoint?.redeemed_points,
        // );
        return { ...newPoint._doc, points: 0 };
      }
      pointExist.points = this.decryptBalance(pointExist.points);
      // pointExist.redeemed_points = this.decryptBalance(
      //   pointExist.redeemed_points,
      // );
      return pointExist;
    } catch (error) {
      console.log(error);
    }
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

  async pointPurchase(dto: pointPurchaseDto, user: JwtPayload) {
    const userData = await this.userService.getUserById(user.sub);
    const validPassword = await bcrypt.compare(dto.password, userData.password);
    if (!validPassword) throw new UnauthorizedException('Invalid Password');
    const balance = await this.getUserPoints(user);
    if (balance.points < dto.amount)
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

  async updateUserPointsNoHistory(userId: string, points: number) {
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

  // async redeemPointsToWallet(amount: number, user: JwtPayload) {
  //   // try {
  //   if (amount > 0) {
  //     const balance = await this.getUserPoints(user);
  //     if (balance.points < amount)
  //       throw new ConflictException('Not enough balance');
  //     await this.updateUserPointsNoHistory(user.sub, 0 - amount);
  //     const userData = await this.userService.getUserById(user.sub);
  //     const tierData: any = await this.tierService.getSingleTier(userData.tier);
  //     const walletamount = Math.round(amount / tierData.benefits.pointValue);
  //     console.log(walletamount);
  //     await this.walletService.updateUserWalletBalance(user.sub, walletamount);
  //     await this.updateRedeemedPoints(user.sub, amount);
  //     await this.transactionHistoryService.addTransactionHistory(
  //       { amount: amount },
  //       user.sub,
  //       'Points redeemed to wallet',
  //       transactionType.Points,
  //       TransactionMode.WITHDRAWAL,
  //       Transaction_APP.LOYALTY_APP,
  //       2,
  //     );

  //     await this.transactionHistoryService.addTransactionHistory(
  //       { amount: walletamount },
  //       user.sub,
  //       'Amount added to wallet by redeeming points',
  //       transactionType.Wallet,
  //       TransactionMode.DEPOSIT,
  //       Transaction_APP.LOYALTY_APP,
  //       2,
  //     );
  // }

  // } catch (error) {
  //   console.log(error);
  // }
  // }

  // async updateRedeemedPoints(userId: string, points: number) {
  //   const pointExists = await this.pointModel.findOne({ user_id: userId });
  //   const decryptedBalabce = this.decryptBalance(pointExists.redeemed_points);
  //   const newbalance = this.encryptBalance(points + decryptedBalabce);
  //   const point = await this.pointModel.updateOne(
  //     { user_id: userId },
  //     { $set: { redeemed_points: newbalance } },
  //     { new: true },
  //   );
  //   return { message: 'updated' };
  // }
  async covertAmountToPoints(amount: number, user: JwtPayload) {
    const userData = await this.userService.getUserById(user.sub);
    const tierData: any = await this.tierService.getSingleTier(userData.tier);
    const converetedAmount = tierData.benefits.pointValue * 20;
    return { points: Math.round(amount / converetedAmount) };
  }
}
