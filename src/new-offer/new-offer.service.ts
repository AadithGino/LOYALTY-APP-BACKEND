import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NewOffer } from './schema/new-offer.schema';
import { Model } from 'mongoose';

@Injectable()
export class NewOfferService {
  constructor(
    @InjectModel(NewOffer.name) private readonly newOfferModel: Model<NewOffer>,
  ) {}

  async addNewOffer(dto) {
    const offers = await this.newOfferModel
      .find()
      .sort({ created_at: -1 })
      .exec();
    console.log(offers[offers.length - 1]);
    if (offers.length >= 10) {
      await this.newOfferModel.deleteOne({
        _id: offers[offers.length - 1]._id,
      });
    }
    return await this.newOfferModel.create(dto);
  }

  async getOffers() {
    return await this.newOfferModel.find();
  }
}
