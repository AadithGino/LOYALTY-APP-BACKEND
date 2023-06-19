import { IsNotEmpty, IsNumber } from "class-validator";

export class transactionDto{
    @IsNotEmpty()
    @IsNumber()
    amount:number;
}