import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class createFriendPaymnetDto{
    @IsNotEmpty()
    @IsNumber()
    amount:number

    @IsNotEmpty()
    @IsString()
    user_id:string
}