import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class createPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  transaction_app: string;
}
