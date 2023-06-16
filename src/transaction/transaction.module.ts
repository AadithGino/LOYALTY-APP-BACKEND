import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports:[WalletModule],
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionModule {}