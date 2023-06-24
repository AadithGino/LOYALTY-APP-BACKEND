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

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(OfferCategory.name)
    private categoryModel: Model<OfferCategory>,
    @InjectModel(Offer.name)
    private offerModel: Model<Offer>,
  ) {}

  async addOfferCategory(dto: createOfferCategoryDto) {
    const exists = await this.categoryModel.findOne({
      name: { $regex: new RegExp(dto.name, 'i') },
    });

    if (exists) throw new ConflictException('Category already exists');
    const category = await this.categoryModel.create(dto);
    return { message: 'Category created successfully', data: category };
  }

  async updateOfferCategory(dto: updateOfferCategoryDto) {
    const exists = await this.categoryModel.findOne({
      name: { $regex: new RegExp(dto.name, 'i') },
    });

    if (exists) throw new ConflictException('Category name already exists');

    await this.categoryModel.updateOne({ _id: dto._id }, { $set: dto });
    return { message: 'Category updated successfully' };
  }

  async getAllOfferCategory() {
    return this.categoryModel.find({ is_active: true });
  }

  async getSingleCategory(categoryId: string) {
    return await this.categoryModel.findOne({ _id: categoryId });
  }

  async addOffer(dto: createOfferDto,image) {
    const category = await this.getSingleCategory(dto.categoryId);

    if (!category) throw new NotFoundException('Category not found');
    const details = {...dto,image}
    const offer = await this.offerModel.create(details);
    return offer;
  }

  async updateOffer(dto: updateOfferDto) {
    const category = await this.getSingleCategory(dto.categoryId);
    if (!category) throw new NotFoundException('Category not found');
    return this.offerModel.updateOne({ _id: dto._id }, { $set: dto });
  }

  async deleteOffer(id: string) {
    await this.offerModel.updateOne(
      { _id: id },
      { $set: { is_deleted: true } },
    );
    return { message: 'Deleted Successfully' };
  }

  async getActiveOffers() {
    const today = new Date().toISOString();
    console.log(today);

    const activeOffers = await this.offerModel.find({
      expiry: { $gte: today },
      is_deleted: false,
    });
    return activeOffers;
  }

  async getAllOffers() {
    return this.offerModel.find();
  }
}
