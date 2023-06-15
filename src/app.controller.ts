import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './shared/decorators/public.decorator';


@Controller()
export class AppController {
   constructor(private readonly appService: AppService) { }

   @Public()
   @Get()
   getMessage() {
      return this.appService.getHello()
   }
}
