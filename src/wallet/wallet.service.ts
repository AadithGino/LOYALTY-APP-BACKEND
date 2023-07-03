import {
  Injectable,
  HttpException,
  forwardRef,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Wallet } from './schema/wallet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { JwtPayload } from 'src/auth/stragtegies';
import { validatePaymentDto } from 'src/transaction/dto';
import { walletPurchaseDto, walletRechargeFromWalletDto } from './dto';
import {
  TransactionMode,
  Transaction_APP,
  transactionType,
} from 'src/transaction/schema/transaction.schema';
import { TransactionHistoryService } from 'src/transaction/transactionHistory.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class WalletService {
  private readonly encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  constructor(
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
    private readonly transactionHistoryService: TransactionHistoryService,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    private readonly userService: UsersService,
  ) {}

  async getWalletBalance(user: JwtPayload) {
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
      user.email,
      transactionType.Wallet,
      TransactionMode.DEPOSIT,
      Transaction_APP.LOYALTY_APP,
    );
  }

  async rechargeFriendWalletFromWallet(
    dto: walletRechargeFromWalletDto,
    user: JwtPayload,
  ) {
    const balance = await this.getWalletBalance(user);
    const userData = await this.userService.getUserById(user.sub);
    const validPassword = await bcrypt.compare(dto.password, userData.password);
    if (!validPassword) throw new UnauthorizedException('Invalid Password');
    if (balance.balance < dto.amount)
      throw new ConflictException('Not enough balance');
    await this.updateUserWalletBalance(user.sub, 0 - dto.amount);
    await this.transactionHistoryService.addTransactionHistory(
      { amount: dto.amount },
      user.sub,
      'Wallet To Wallet Transfer',
      transactionType.Wallet,
      TransactionMode.WITHDRAWAL,
      Transaction_APP.LOYALTY_APP,
      2,
      dto.user_id,
    );
    await this.updateUserWalletBalance(dto.user_id, dto.amount);
    await this.transactionHistoryService.addTransactionHistoryForUserToUser(
      { amount: dto.amount },
      dto.user_id,
      'Wallet To Wallet Transfer',
      transactionType.Wallet,
      TransactionMode.DEPOSIT,
      Transaction_APP.LOYALTY_APP,
      2,
      user.sub,
    );
    return { message: 'Wallet Recharge Successfull', amount: dto.amount };
  }

  async validateWalletRechargeRequest(
    dto: validatePaymentDto,
    user: JwtPayload,
  ) {
    return await this.transactionService.validateTransaction(dto, user, true);
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

  async walletPurchase(dto: walletPurchaseDto, user: JwtPayload) {
    const balance = await this.getWalletBalance(user);
    const userData = await this.userService.getUserById(user.sub);
    const validPassword = await bcrypt.compare(dto.password, userData.password);
    if (!validPassword) {
      await this.transactionHistoryService.addFailureTransactionHistory(
        dto.amount,
        user.sub,
        dto.reason,
        transactionType.Wallet,
        TransactionMode.WITHDRAWAL,
        dto.transaction_app,
        'Invalid password',
      );
      throw new UnauthorizedException('Invalid Password');
    }
    if (balance.balance < dto.amount)
      throw new ConflictException('Not enough balance');
    await this.updateUserWalletBalance(user.sub, 0 - dto.amount);
    await this.transactionHistoryService.addTransactionHistory(
      { amount: dto.amount },
      user.sub,
      dto.reason,
      transactionType.Wallet,
      TransactionMode.WITHDRAWAL,
      dto.transaction_app,
      2,
    );
    return { message: 'Transaction Successfull' };
  }
}


