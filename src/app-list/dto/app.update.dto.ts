import { IsNotEmpty, IsString } from "class-validator";

export class updateAppDto {
    @IsNotEmpty()
    @IsString()
    name:string

    @IsNotEmpty()
    @IsString()
    _id:string
}