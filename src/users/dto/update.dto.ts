import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { IsPhoneNumber } from 'src/shared/validator/phone-number-validator';

export class updateUserProfileDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsDateString()
  @IsNotEmpty()
  dob: Date;

  @IsNotEmpty()
  gender: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsNotEmpty()
  @IsString()
  place: string;
}
