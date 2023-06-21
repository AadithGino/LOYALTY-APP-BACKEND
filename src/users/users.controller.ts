import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RoleGuard } from 'src/shared/guards';
import { UserRoles } from './schema/user.schema';

@Controller('users')
export class UsersController {

    @Roles(UserRoles.ADMIN)
    @UseGuards(RoleGuard)
    @Get()
    getUser(){
        return 'User';
    }
}
