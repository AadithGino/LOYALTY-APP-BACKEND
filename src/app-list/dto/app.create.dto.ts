import { IsNotEmpty, IsString } from "class-validator";

export class createAppDto {
    @IsNotEmpty()
    @IsString()
    name:string
}