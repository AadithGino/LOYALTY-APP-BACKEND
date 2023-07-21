import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandSchema } from './schema/brand.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Brand', schema: BrandSchema }]),
    UsersModule,
  ],
  providers: [BrandsService],
  controllers: [BrandsController],
})
export class BrandsModule {}
