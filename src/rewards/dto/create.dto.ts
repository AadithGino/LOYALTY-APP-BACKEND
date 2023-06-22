import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class createRewardDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    points_required:number

    @IsNotEmpty()
    @IsString()
    description:string
}