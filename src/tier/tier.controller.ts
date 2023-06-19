import { Body, Controller, Post ,Get, Param} from '@nestjs/common';
import { TierService } from './tier.service';
import { Public } from 'src/shared/decorators';

@Controller('tier')
export class TierController {
    constructor(private readonly tierService: TierService){}

    @Public()
    @Post('/add')
    addTier(@Body() dto){
        return this.tierService.addTier(dto)
    }

    @Get()
    getTiers(){
        return this.tierService.getTiers()
    }

    @Get(':id')
    getSingleTier(@Param('id') id:string){
        return this.tierService.getSingleTier(id)
    }
}
