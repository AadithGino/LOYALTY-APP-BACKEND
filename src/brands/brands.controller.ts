import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFile,
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
}
