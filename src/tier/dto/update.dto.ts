import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class updateTierDto{

    @IsNotEmpty()
    @IsString()
    tierId: string;

    @IsNotEmpty()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsNumber()
    maxDiscount:number;

    @IsNotEmpty()
    @IsNumber()
    minimumPointsForTier:number;

    @IsNotEmpty()
    @IsNumber()
    moneyToBeSpend:number;

    @IsNotEmpty()
    pointValue:number;
    
}