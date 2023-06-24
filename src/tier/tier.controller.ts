import { Body, Controller, Post, Get, Param, UseGuards,Put } from '@nestjs/common';
import { TierService } from './tier.service';
import { UserRoles } from 'src/users/schema/user.schema';
import { RoleGuard } from 'src/shared/guards';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { createTierDto, updateTierDto } from './dto';


@Controller('tier')
export class TierController {
    constructor(private readonly tierService: TierService) { }

    @Roles(UserRoles.ADMIN)
    @UseGuards(RoleGuard)
    @Post('/add')
    addTier(@Body() dto:createTierDto) {
        return this.tierService.addTier(dto)
    }

    @Get()
    getTiers() {
        return this.tierService.getTiers()
    }

    @Get(':tier')
    getSingleTier(@Param('tier') tier: string) {
        return this.tierService.getSingleTier(tier)
    }

    @Roles(UserRoles.ADMIN)
    @UseGuards(RoleGuard)
    @Put('/update')
    updateTierDetails(@Body() dto:updateTierDto){
        return this.tierService.updatTierDetails(dto)
    }
}
