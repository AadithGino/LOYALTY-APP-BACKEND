import { Module } from '@nestjs/common';
import { NewOfferService } from './new-offer.service';
import { NewOfferController } from './new-offer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { newOfferSchema } from './schema/new-offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'NewOffer', schema: newOfferSchema }]),
  ],
  providers: [NewOfferService],
  controllers: [NewOfferController],
})
export class NewOfferModule {}
