import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './shared/guards';


@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
  MongooseModule.forRoot(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }),
    UsersModule,
    AuthModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AtGuard }],
})
export class AppModule { }
