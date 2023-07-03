import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class updateOfferCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  start: string;

  @IsNotEmpty()
  @IsDateString()
  expiry: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @IsString()
  _id: string;
}
