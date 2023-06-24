import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { offerCategorySchema } from './schema/category.schema';
import { offerSchema } from './schema/offer.schema';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'OfferCategory', schema: offerCategorySchema },
      { name: 'Offer', schema: offerSchema },
    ]),
    UsersModule
  ],
  providers: [OffersService],
  controllers: [OffersController],
})
export class OffersModule {}

