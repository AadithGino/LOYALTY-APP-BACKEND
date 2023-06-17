import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class validatePaymentDto{
    @IsNotEmpty()
    @IsNumber()
    amount:number;

    @IsNotEmpty()
    @IsString()
    paymentIntentId:string

    @IsNotEmpty()
    transactionId:string

    @IsOptional()
    @IsString()
    comment:string
}