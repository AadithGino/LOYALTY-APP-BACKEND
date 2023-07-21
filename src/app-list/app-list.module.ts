import { Module } from '@nestjs/common';
import { AppListService } from './app-list.service';
import { AppListController } from './app-list.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppListSchema } from './schema/app-list.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AppList', schema: AppListSchema }]),
    UsersModule,
  ],
  providers: [AppListService],
  controllers: [AppListController],
})
export class AppListModule {}
