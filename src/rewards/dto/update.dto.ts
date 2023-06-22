import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class updateRewardDto {

    @IsNotEmpty()
    @IsString()
    _id: string;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsNumber()
    points_required:number
}