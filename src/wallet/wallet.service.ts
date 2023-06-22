import {
  Injectable,
  HttpException,
  forwardRef,
  Inject,
  Query,
  ConflictException,
} from '@nestjs/common';
import { Wallet } from './schema/wallet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { JwtPayload } from 'src/auth/stragtegies';
import { validatePaymentDto } from 'src/transaction/dto';
import { walletRechargeFromWalletDto } from './dto';
import {
  TransactionMode,
  transactionType,
} from 'src/transaction/schema/transaction.schema';

@Injectable()
export class WalletService {
  private readonly encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  constructor(
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly userService: UsersService,
  ) {}

  async getWalletBalance(user) {
    const wallet: any = await this.walletModel.findOne({ user_id: user.sub });
    const userdata = await this.userService.getUserByEmail(user.email);
    if (!wallet) {
      const newWallet: any = await this.walletModel.create({
        user_id: user.sub,
        currency: userdata.currency,
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
      const userdata = await this.userService.getUserById(userId);
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
          currency: userdata.currency,
        });
        return true;
      }
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async createWalletRechargeRequest(dto, user: JwtPayload) {
    const userdata = await this.userService.getUserById(user.sub);
    return this.transactionService.createTransaction(
      dto.amount,
      user.sub,
      userdata.currency,
      'Wallet Recharge',
    );
  }

  async rechargeFriendWalletFromWallet(
    dto: walletRechargeFromWalletDto,
    user: JwtPayload,
  ) {
    const balance = await this.getWalletBalance(user);
    
    if (balance.balance < dto.amount)
      throw new ConflictException('Not enough balance');
    await this.updateUserWalletBalance(user.sub, 0 - dto.amount);
    await this.transactionService.addTransactionHistory(
      { amount: dto.amount },
      user.sub,
      'Wallet To Wallet Transfer',
      transactionType.Wallet,
      TransactionMode.WITHDRAWAL,
      2,
      dto.user_id,
    );
    await this.updateUserWalletBalance(dto.user_id, dto.amount);
    await this.transactionService.addTransactionHistoryForUserToUser(
      { amount: dto.amount },
      dto.user_id,
      'Wallet To Wallet Transfer',
      transactionType.Wallet,
      TransactionMode.DEPOSIT,
      2,
      user.sub,
    );
    return { message: 'Wallet Recharge Successfull', amount: dto.amount };
  }

  async validateWalletRechargeRequest(
    dto: validatePaymentDto,
    user: JwtPayload,
  ) {
    return await this.transactionService.validateTransaction(dto, user);
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
