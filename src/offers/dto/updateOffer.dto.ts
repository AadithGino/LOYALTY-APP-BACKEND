import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class updateOfferDto{
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description:string;

    @IsNotEmpty()
    @IsDateString()
    expiry:Date;

    @IsNotEmpty()
    @IsString()
    categoryId:string;

    @IsNotEmpty()
    @IsString()
    _id:string;
}