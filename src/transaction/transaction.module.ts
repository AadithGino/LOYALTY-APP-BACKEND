import { Module, forwardRef } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { transactionSchema } from './schema/transaction.schema';
import { TransactionHistoryService } from './transactionHistory.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    forwardRef(() => WalletModule),
    MongooseModule.forFeature([
      { name: 'Transaction', schema: transactionSchema },
    ]),
    UsersModule,
  ],
  providers: [TransactionService, TransactionHistoryService],
  controllers: [TransactionController],
  exports: [TransactionService, TransactionHistoryService],
})
export class TransactionModule {}
