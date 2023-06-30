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

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(OfferCategory.name)
    private categoryModel: Model<OfferCategory>,
    @InjectModel(Offer.name)
    private offerModel: Model<Offer>,
    private readonly userService: UsersService,
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

    if (exists && exists._id.toString() !== dto._id)
      throw new ConflictException('Category name already exists');

    await this.categoryModel.updateOne({ _id: dto._id }, { $set: dto });
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
    const details = { ...dto, image: image.filename };
    const offer = await this.offerModel.create(details);
    return offer;
  }

  async updateOffer(dto: updateOfferDto, image: Express.Multer.File) {
    const category = await this.getSingleCategory(dto.category_id);
    if (!category) throw new NotFoundException('Category not found');
    if (image) {
      const details = { ...dto, image: image.filename };
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

  async getPreferenceOffers(user: JwtPayload) {
    const userData = await this.userService.getUserById(user.sub);
    console.log(userData.interests);

    const offers = await this.offerModel
      .find({ category_id: { $in: userData.interests } })
      .exec();
    if (offers.length > 0) return offers;
    return await this.offerModel.find();
  }
}
