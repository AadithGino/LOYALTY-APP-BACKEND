import { Module } from '@nestjs/common';
import { TierService } from './tier.service';
import { TierController } from './tier.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { tierSchema } from './schema/tire.schema';
import { userSchema } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tier', schema: tierSchema },
      { name: 'User', schema: userSchema },
    ]),
  ],
  providers: [TierService],
  controllers: [TierController],
  exports: [TierService],
})
export class TierModule {}
