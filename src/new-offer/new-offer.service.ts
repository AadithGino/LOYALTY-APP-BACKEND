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
  try {
    const offerExists = await this.newOfferModel.findOne({ app: dto.app });
    if (offerExists) {
      await this.newOfferModel.updateOne(
        { _id: offerExists._id },
        { $set: dto },
      );
      return { message: 'updated successfully' };
    } else {
      await this.newOfferModel.create(dto);
      return { message: 'added successfully' };
    }
  } catch (error) {
    console.log(error);
    
  }
  }

  async getOffers() {
    return await this.newOfferModel.find();
  }
}
