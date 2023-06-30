import {IsNotEmpty, IsString, Validate } from 'class-validator';
import { WeakPasswordValidator } from 'src/shared/validator/weak-password.validator';

export class updateUserPasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string

  @IsNotEmpty()
  @Validate(WeakPasswordValidator)
  newPassword: string;
}
