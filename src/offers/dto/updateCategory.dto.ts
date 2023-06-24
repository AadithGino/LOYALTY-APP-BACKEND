import { IsNotEmpty, IsString } from "class-validator";

export class updateOfferCategoryDto{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description:string;

    @IsNotEmpty()
    @IsString()
    _id: string;
}