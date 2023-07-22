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
import { GetUser, Public } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('offers')
export class OffersController {
  constructor(private readonly offerService: OffersService) {}

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @UseInterceptors(uploadInterceptor())
  @Post('/category')
  addOfferCategory(
    @Body() dto: createOfferCategoryDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.offerService.addOfferCategory(dto, image);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Post('/category-update')
  @UseInterceptors(uploadInterceptor())
  updateOfferCategory(
    @Body() dto: updateOfferCategoryDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.offerService.updateOfferCategory(dto, image);
  }

  @Public()
  @Get('/category')
  getCategory() {
    return this.offerService.getAllOfferCategory();
  }

  @Get('/category/:categoryId')
  getSingleCategory(@Param('categoryId') categoryId: string) {
    return this.offerService.getSingleCategory(categoryId);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Post()
  @UseInterceptors(uploadInterceptor())
  addOffer(
    @Body() dto: createOfferDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.offerService.addOffer(dto, image);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Put()
  @UseInterceptors(uploadInterceptor())
  updateOffer(
    @Body() dto: updateOfferDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.offerService.updateOffer(dto, image);
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
  getAllOffers() {
    return this.offerService.getAllOffers();
  }

  @Public()
  @Get()
  getActiveOffers() {
    return this.offerService.getActiveOffers();
  }

  @Get('/single-offer')
  getSingleOffer(@Query('id') id: string) {
    return this.offerService.getSingleOffer(id);
  }

  @Get('/get-preference')
  getPrefrerenceOffer(@GetUser() user: JwtPayload) {
    return this.offerService.getPreferenceOffers(user);
  }

  @Get('/get-offers/:categoryId')
  getOffersByCategory(@Param('categoryId') categoryId: string) {
    return this.offerService.getOffersByCategory(categoryId);
  }

  // get offers by category name
  @Get('/category-offers/:category')
  getCategoryOffers(@Param('category') category:string){
    return this.offerService.getCategoryOffers(category)
  }

  @Post('/add-external-offer')
  addOtherOffer(@Body() dto){
    return this.offerService.addOtherOffer(dto)
  }
}
