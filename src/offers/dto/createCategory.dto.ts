import { IsNotEmpty, IsString } from "class-validator";

export class createOfferCategoryDto{
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description:string;
}