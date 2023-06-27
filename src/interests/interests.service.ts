import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interest } from './schema/interests.schema';
import { Model } from 'mongoose';

@Injectable()
export class InterestsService {
  // constructor(
  //   @InjectModel(Interest.name) private readonly interestModel: Model<Interest>,
  // ) {}

  // async createInterest(dto) {
  //   return await this.interestModel.create(dto);
  // }

  // async addInterest(dto) {
  //   await this.interestModel.updateOne(
  //     { _id: dto.id },
  //     { $push: dto.categoryId },
  //   );
  // }

  // async removeInterest(dto) {
  //   await this.interestModel.updateOne(
  //     { _id: dto.id },
  //     { $pull: dto.categoryId },
  //   );
  // }

  // async getInterest() {
  //   return await this.interestModel.find();
  // }

  // async getSingleInterest(id){
  //   return await this.interestModel.findOne({_id:id})
  // }
}
