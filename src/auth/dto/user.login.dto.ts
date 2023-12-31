import { IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';

export class userLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
