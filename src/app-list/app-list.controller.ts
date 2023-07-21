import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  Delete,
  Query,
} from '@nestjs/common';
import { AppListService } from './app-list.service';
import { uploadInterceptor } from 'src/shared/imageUpload/multer';
import { RoleGuard } from 'src/shared/guards';
import { UserRoles } from 'src/users/schema/user.schema';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { createAppDto, updateAppDto } from './dto';

@Controller('applist')
export class AppListController {
  constructor(private readonly appListService: AppListService) {}

  @Get()
  getAllApps() {
    return this.appListService.getAllApps();
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @UseInterceptors(uploadInterceptor())
  @Post()
  addApp(
    @Body() dto: createAppDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.appListService.addApp(dto, image);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @UseInterceptors(uploadInterceptor())
  @Put()
  updateApp(@Body() dto: updateAppDto, @UploadedFile() image) {
    return this.appListService.updateApp(dto, image);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(RoleGuard)
  @Delete()
  deleteApp(@Query('id') id: string) {
    return this.appListService.deleteApp(id);
  }
}
