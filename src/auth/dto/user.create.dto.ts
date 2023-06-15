import { IsNotEmpty, IsEmail, IsString, MinLength, Validate } from "class-validator";
import { WeakPasswordValidator } from "src/shared/validator/weak-password.validator";

export class userSignUpDto {

    @IsNotEmpty({message:"Enter Username"})
    @IsString({message:"Enter a valid Username"})
    @MinLength(3,{message:"Enter a valid username"})
    username:string;

    @IsEmail()
    email: string;

    @Validate(WeakPasswordValidator)
    password: string; 
}