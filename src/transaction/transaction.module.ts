import { Module, forwardRef } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, transactionSchema } from './schema/transaction.schema';

@Module({
  imports: [
    forwardRef(() => WalletModule),
    MongooseModule.forFeature([
      { name: 'Transaction', schema: transactionSchema },
    ]),
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports:[TransactionService]
})
export class TransactionModule {}
