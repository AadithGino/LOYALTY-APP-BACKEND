import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsController } from './points.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { pointSchema } from './schema/points.schema';
import { TierModule } from 'src/tier/tier.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UsersModule } from 'src/users/users.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Point', schema: pointSchema }]),
    TierModule,
    TransactionModule,
    UsersModule,
    // WalletModule
  ],
  providers: [PointsService],
  controllers: [PointsController],
  exports:[PointsService]
})
export class PointsModule {}
