import { IsNotEmpty, IsNumber, IsString, isNotEmpty } from 'class-validator';

export class walletRechargeFromWalletDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  user_id: string;
}
