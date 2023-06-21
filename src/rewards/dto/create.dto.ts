import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class createRewardDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    points_on_completion:number
}