import { Controller, UseGuards, Post, Get, Put, Query } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRoles } from 'src/users/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';


@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  // @Roles(UserRoles.ADMIN, UserRoles.USER)
  // @UseGuards(RoleGuard)
  // @Post('/create')
  // async createInterest(dto) {
  //   return await this.interestsService.createInterest(dto);
  // }

  // @Roles(UserRoles.ADMIN, UserRoles.USER)
  // @UseGuards(RoleGuard)
  // @Put('/add')
  // async addInterest(dto) {
  //   return await this.interestsService.addInterest(dto);
  // }

  // @Roles(UserRoles.ADMIN, UserRoles.USER)
  // @UseGuards(RoleGuard)
  // @Put('/remove')
  // async removeInterest(dto) {
  //   return await this.interestsService.removeInterest(dto);
  // }

  // @Get()
  // getInterests() {
  //   return this.interestsService.getInterest();
  // }

  // @Get('/single')
  // getSingleInterest(@Query('id') id) {
  //   return this.interestsService.getSingleInterest(id);
  // }
}
