import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AtStrategy } from './stragtegies/at.strategy';
import { RtStrategy } from './stragtegies/rt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PointsModule } from 'src/points/points.module';

@Module({
  imports: [UsersModule, JwtModule.register({}), PointsModule],
  providers: [AuthService, AtStrategy, RtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
