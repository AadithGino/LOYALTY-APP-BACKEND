import { Controller,Post,Body,Get } from '@nestjs/common';
import { NewOfferService } from './new-offer.service';

@Controller('new-offer')
export class NewOfferController {
    constructor(private readonly newOfferService: NewOfferService){}

    @Post('/add')
    addOffer(@Body() dto){
        return this.newOfferService.addNewOffer(dto)
    }

    @Get('/')
    getOffer(){
        return this.newOfferService.getOffers()
    }
}
