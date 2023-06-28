import { Controller, Get, Post, Put, Body } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleGuard } from 'src/shared/guards';
import { UserRoles } from './schema/user.schema';
import { UsersService } from './users.service';
import { updateUserProfileDto } from './dto';
import { GetUser } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/stragtegies';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('/single-user')
  getUserProfile(@GetUser() user: JwtPayload) {
    return this.userService.getUserById(user.sub);
  }

  @Put('/update-profile')
  updateProfile(
    @Body() dto: updateUserProfileDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.userService.updateProfile(dto, user);
  }

  @Get('/all')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/update-password')
  updatePassword(@Body() dto,@GetUser() user: JwtPayload) {
    return this.userService.updateUserPassword(dto,user)
  }

  @Post('/update-interests')
  updateUserInterests(@Body() dto,@GetUser() user: JwtPayload){
    return this.userService.updateUserIntererst(dto,user)
  }

  @Post('/add-interests')
  addUserInterests(@Body() dto,@GetUser() user: JwtPayload){
    return this.userService.addUserInterests(dto,user)
  }

  @Post('/remove-interests')
  removeUserInterests(@Body() dto,@GetUser() user: JwtPayload){
    return this.userService.removeUserInterests(dto,user)
  }

  @Get('/refered-users')
  getReferedUsers(@GetUser() user:JwtPayload){
    return this.userService.getReferedUsers(user)
  }
}
