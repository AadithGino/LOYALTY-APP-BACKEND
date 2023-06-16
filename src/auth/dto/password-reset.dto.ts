import { IsNotEmpty, IsEmail, IsString, MinLength } from "class-validator";

export class passwordResetDto {
    @IsEmail()
    email: string;
}