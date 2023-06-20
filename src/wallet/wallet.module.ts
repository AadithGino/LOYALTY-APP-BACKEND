import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletSchema } from './schema/wallet.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[MongooseModule.forFeature([{name:"Wallet",schema:WalletSchema}]),UsersModule],
  providers: [WalletService],
  controllers: [WalletController],
  exports:[WalletService]
})
export class WalletModule {}
