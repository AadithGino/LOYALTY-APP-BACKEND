import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OfferCategory } from './schema/category.schema';
import {
  createOfferCategoryDto,
  createOfferDto,
  updateOfferCategoryDto,
} from './dto';
import { Offer } from './schema/offer.schema';
import { updateOfferDto } from './dto/updateOffer.dto';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from 'src/auth/stragtegies';
import * as fs from 'fs';
import * as path from 'path';
import * as AWS from 'aws-sdk';

@Injectable()
export class OffersService {
  private s3: AWS.S3;

  constructor(
    @InjectModel(OfferCategory.name)
    private categoryModel: Model<OfferCategory>,
    @InjectModel(Offer.name)
    private offerModel: Model<Offer>,
    private readonly userService: UsersService,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_S3_REGION,
    });
  }

  async addOfferCategory(
    dto: createOfferCategoryDto,
    image: Express.Multer.File,
  ) {
    const exists = await this.categoryModel.findOne({
      name: { $regex: new RegExp(dto.name, 'i') },
    });

    if (exists) throw new ConflictException('Category already exists');
    const category = await this.categoryModel.create({
      ...dto,
      image: image.filename,
    });
    return { message: 'Category created successfully', data: category };
  }

  async updateOfferCategory(
    dto: updateOfferCategoryDto,
    image: Express.Multer.File,
  ) {
    const exists = await this.categoryModel.findOne({
      name: { $regex: new RegExp(dto.name, 'i') },
    });

    if (exists && exists._id.toString() !== dto._id)
      throw new ConflictException('Category name already exists');

    if (image) {
      const offerCategory = await this.categoryModel.findOne({ _id: dto._id });
      if (offerCategory.image) {
        this.deleteFile(offerCategory.image);
      }
      await this.categoryModel.updateOne(
        { _id: dto._id },
        { $set: { ...dto, image: image.filename } },
      );
    } else {
      await this.categoryModel.updateOne(
        { _id: dto._id },
        { $set: { ...dto } },
      );
    }
    return { message: 'Category updated successfully' };
  }

  async getAllOfferCategory() {
    return this.categoryModel.find({ is_active: true });
  }

  async getSingleCategory(categoryId: string) {
    return await this.categoryModel.findOne({ _id: categoryId });
  }

  async addOffer(dto: createOfferDto, image: Express.Multer.File) {
    const category = await this.getSingleCategory(dto.category_id);
    if (!category) throw new NotFoundException('Category not found');
    const imageUrl = await this.uploadImageToS3(image);
    const details = { ...dto, image: imageUrl };
    const offer = await this.offerModel.create(details);
    return offer;
  }

  async updateOffer(dto: updateOfferDto, image: Express.Multer.File) {
    const category = await this.getSingleCategory(dto.category_id);
    const offer = await this.offerModel.findOne({ _id: dto._id });
    console.log(offer);

    if (!category) throw new NotFoundException('Category not found');
    if (image) {
      if (offer.image) {
        // this.deleteImageFromS3(offer.image);
      }
      const imageUrl = await this.uploadImageToS3(image);
      const details = { ...dto, image: imageUrl };
      return this.offerModel.updateOne({ _id: dto._id }, { $set: details });
    }
    return this.offerModel.updateOne({ _id: dto._id }, { $set: dto });
  }

  async deleteOffer(id: string) {
    await this.offerModel.updateOne(
      { _id: id },
      { $set: { is_deleted: true } },
    );
    return { message: 'Deleted Successfully' };
  }

  // getting offers which are not deleted and not expired
  async getActiveOffers() {
    const today = new Date();
    today.setHours(0, 0, 0, 0).toString();
    const activeOffers = await this.offerModel.find({
      expiry: { $gte: today },
      is_deleted: false,
    });
    return activeOffers;
  }

  async getAllOffers() {
    return this.offerModel.find();
  }

  async getSingleOffer(id: string) {
    return await this.offerModel.findOne({ _id: id }).populate('category_id');
  }

  // getting offers which are not deleted and not expired
  // async getPreferenceOffers(user: JwtPayload) {
  //   const userData = await this.userService.getUserById(user.sub);
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0).toString();
  //   const offers = await this.offerModel
  //     .find({
  //       category_id: { $in: userData.interests },
  //       expiry: { $gte: today },
  //       is_deleted: false,
  //     })
  //     .exec();
  //   if (offers.length > 0) return offers;
  //   return await this.offerModel.find();
  // }

  async getPreferenceOffers(user: JwtPayload) {
    const userData = await this.userService.getUserById(user.sub);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const preferredOffers = await this.offerModel
      .find({
        category_id: { $in: userData.interests },
        expiry: { $gte: today },
        is_deleted: false,
      })
      .exec();

    let remainingOffers = [];

    if (preferredOffers.length > 0) {
      const preferredOfferIds = preferredOffers.map((offer) => offer._id);
      remainingOffers = await this.offerModel
        .find({
          _id: { $nin: preferredOfferIds },
          is_deleted: false,
          expiry: { $gte: today },
        })
        .exec();
    } else {
      remainingOffers = await this.offerModel
        .find({ is_deleted: false })
        .exec();
    }

    const offers = [...preferredOffers, ...remainingOffers];
    return offers;
  }

  // getting offers which are not deleted and not expired
  async getOffersByCategory(categoryId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0).toString();
    return this.offerModel.find({
      category_id: categoryId,
      expiry: { $gte: today },
      is_deleted: false,
    });
  }

  async getCategoryOffers(category: string) {
    const id = await this.categoryModel.findOne({
      name: { $regex: new RegExp(category, 'i') },
    });
    return this.getOffersByCategory(id._id.toString());
  }

  deleteFile(filename: string): void {
    const filePath = path.resolve(__dirname, '..', '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async uploadImageToS3(image: Express.Multer.File): Promise<string> {
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `images/${image.filename}`,
      Body: fs.readFileSync(image.path),
    };

    const s3UploadResponse = await this.s3.upload(uploadParams).promise();
    // Delete the local image file after successful upload to S3
    this.deleteFile(image.filename);
    console.log(s3UploadResponse.Location.slice(50));
    console.log(s3UploadResponse.Key);
    return s3UploadResponse.Location;
  }

  async deleteImageFromS3(key: string): Promise<void> {
    console.log('Ddsf');

    const bucketName = process.env.AWS_S3_BUCKET;
    const params: AWS.S3.Types.DeleteObjectRequest = {
      Bucket: bucketName,
      Key: `images/${key.slice(50)}`,
    };
    try {
      const delteted = await this.s3.deleteObject(params).promise();
      console.log(delteted);
    } catch (error) {
      console.log(error);
    }
  }
}
