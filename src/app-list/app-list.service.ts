import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppList } from './schema/app-list.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppListService {
  constructor(
    @InjectModel(AppList.name) private readonly appListModel: Model<AppList>,
  ) {}

  async getAllApps() {
    return await this.appListModel.find();
  }

  async addApp(dto, image: Express.Multer.File) {
    return await this.appListModel.create({ ...dto, image: image.filename });
  }

  async updateApp(dto, image: Express.Multer.File) {
    if (image) {
      const app = await this.appListModel.findOne({ _id: dto._id });
      this.deleteFile(app.image);
      await this.appListModel.updateOne(
        { _id: dto._id },
        { $set: { name: dto.name, image: image.filename } },
      );
      return { message: 'updated successfully' };
    } else {
      await this.appListModel.updateOne(
        { _id: dto._id },
        { $set: { name: dto.name } },
      );
      return { message: 'updated successfully' };
    }
  }

  async deleteApp(id: string) {
    return await this.appListModel.deleteOne({ _id: id });
  }

  deleteFile(filename: string): void {
    const filePath = path.resolve(__dirname, '..', '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
