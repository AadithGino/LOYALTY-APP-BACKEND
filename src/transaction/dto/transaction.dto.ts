import { IsNotEmpty, IsNumber } from "class-validator";

export class transactionDtoP{
    @IsNotEmpty()
    @IsNumber()
    amount:number;
}