import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from 'src/users/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';
import {
  createOfferCategoryDto,
  createOfferDto,
  updateOfferCategoryDto,
} from './dto';
import { updateOfferDto } from './dto/updateOffer.dto';
import { uploadInterceptor } from 'src/shared/imageUpload/multer';

@Controller('offers')
export class OffersController {
  constructor(private readonly offerService: OffersService) {}

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Post('/category')
  addOfferCategory(@Body() dto: createOfferCategoryDto) {
    return this.offerService.addOfferCategory(dto);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Put('/category')
  updateOfferCategory(@Body() dto: updateOfferCategoryDto) {
    return this.offerService.updateOfferCategory(dto);
  }

  @Get('/category')
  getCategory() {
    return this.offerService.getAllOfferCategory();
  }

  @Get('/category/:categoryId')
  getSingleCategory(@Param('categoryId') categoryId) {
    return this.offerService.getSingleCategory(categoryId);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  @UseInterceptors(uploadInterceptor())
  addOffer(@Body() dto: createOfferDto,@UploadedFile() image) {
    return this.offerService.addOffer(dto,image);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Put()
  @UseInterceptors(uploadInterceptor())
  updateOffer(@Body() dto: updateOfferDto,@UploadedFile() image) {
    return this.offerService.updateOffer(dto,image);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Delete()
  deleteOffer(@Query('id') id: string) {
    return this.offerService.deleteOffer(id);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Get('/all')
  getAllOffers(){
    return this.offerService.getAllOffers();
  }

  @Get()
  getActiveOffers(){
    return this.offerService.getActiveOffers();
  }
}
