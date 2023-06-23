import {IsDateString, IsNotEmpty, IsString } from "class-validator";

export class updateUserProfileDto{

    @IsNotEmpty()
    @IsString()
    first_name:string;

    @IsNotEmpty()
    @IsString()
    last_name:string;

    @IsDateString()
    @IsNotEmpty()
    dob:Date;

    
    @IsNotEmpty()
    gender:string;

    @IsNotEmpty()
    phone_number:string;

    @IsNotEmpty()
    @IsString()
    place:string;
}