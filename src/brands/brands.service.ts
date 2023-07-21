import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './schema/brand.schema';
import { Model } from 'mongoose';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
  ) {}

  async addBrand(dto, image: Express.Multer.File) {
    return await this.brandModel.create({ ...dto, image: image.filename });
  }

  async getBrands(){
    return await this.brandModel.find({})
  }
}
