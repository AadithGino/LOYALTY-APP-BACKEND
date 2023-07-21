import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand } from './schema/brand.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
  ) {}

  async addBrand(dto, image: Express.Multer.File) {
    return await this.brandModel.create({ ...dto, image: image.filename });
  }

  async updateBrand(dto, image: Express.Multer.File) {
    try {
      if (image) {
        const brand = await this.brandModel.findOne({_id:dto._id})
        this.deleteFile(brand.image)
        await this.brandModel.updateOne(
          { _id: dto._id },
          { $set: { name: dto.name, url: dto.url, image: image.filename } },
        );
        return { message: 'updated successfully' };
      } else {
        await this.brandModel.updateOne(
          { _id: dto._id },
          { $set: { name: dto.name, url: dto.url } },
        );
        return {message:"Updated successfully"}
      }
    } catch (error) {
      console.log(error);
      
    }
  }

  async getAllBrands() {
    return await this.brandModel.find({ is_deleted: false });
  }

  async deleteBrand(id: string) {
    await this.brandModel.updateOne(
      { _id: id },
      { $set: { is_deleted: true } },
    );
    return {message:"deleted successfully"}
  }

  deleteFile(filename: string): void {
    const filePath = path.resolve(__dirname, '..', '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
