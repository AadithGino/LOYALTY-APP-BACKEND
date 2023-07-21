import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandSchema } from './schema/brand.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Brand', schema: BrandSchema }]),
  ],
  providers: [BrandsService],
  controllers: [BrandsController],
})
export class BrandsModule {}
