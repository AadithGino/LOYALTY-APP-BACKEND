import { IsNotEmpty, IsEmail, IsString, MinLength, Validate } from "class-validator";
import { WeakPasswordValidator } from "src/shared/validator/weak-password.validator";

export class validateOtpDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    otp:string

    @Validate(WeakPasswordValidator)
    @IsNotEmpty()
    password:string
}