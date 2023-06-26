import { IsNotEmpty, IsNumber } from 'class-validator';

export class createPaymnetDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
