import { IsNotEmpty, IsEmail, IsString } from "class-validator";

export class userLoginDto {
    @IsEmail()
    email: string;


    @IsNotEmpty()
    @IsString()
    password: string;
}