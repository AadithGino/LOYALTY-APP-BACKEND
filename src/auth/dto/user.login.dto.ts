import { IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";

export class userLoginDto {
    @IsEmail()
    Email: string;

    @IsNotEmpty()
    @IsString()
    Password: string; 
}