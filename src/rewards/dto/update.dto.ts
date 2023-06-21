import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class updateRewardDto {

    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    points_on_completion:number
}