import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { interestSchema } from './schema/interests.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Interests', schema: interestSchema }]),
  ],
  providers: [InterestsService],
  controllers: [InterestsController],
})
export class InterestsModule {}
