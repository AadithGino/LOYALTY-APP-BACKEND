import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class updateOfferDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  expiry: Date;

  @IsNotEmpty()
  @IsString()
  category_id: string;

  @IsNotEmpty()
  @IsString()
  _id: string;
}
