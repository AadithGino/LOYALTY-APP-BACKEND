import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { uploadInterceptor } from 'src/shared/imageUpload/multer';
import { BrandsService } from './brands.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from 'src/users/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandService: BrandsService) {}

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @UseInterceptors(uploadInterceptor())
  @Post()
  addBrand(@Body() dto, @UploadedFile() image: Express.Multer.File) {
    return this.brandService.addBrand(dto, image);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @UseInterceptors(uploadInterceptor())
  @Put()
  updateBrand(@Body() dto, @UploadedFile() image: Express.Multer.File) {
    return this.brandService.updateBrand(dto, image);
  }

  @Get()
  getAllBrands() {
    return this.brandService.getAllBrands();
  }

  @Delete()
  deleteBrand(@Query('id') id: string) {
    return this.brandService.deleteBrand(id);
  }
}
