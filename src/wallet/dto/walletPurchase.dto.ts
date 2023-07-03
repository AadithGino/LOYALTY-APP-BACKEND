import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class walletPurchaseDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number

    @IsNotEmpty()
    @IsString()
    reason:string

    @IsNotEmpty()
    @IsString()
    password:string

    @IsNotEmpty()
    @IsString()
    transaction_app:string
}