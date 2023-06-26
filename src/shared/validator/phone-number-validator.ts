import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'phoneNumber', async: false })
export class PhoneNumberValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (!value) {
      return false; // Empty values are considered invalid
    }

    // Define your regular expression for phone number validation
    const phoneNumberRegex =
      /^(\+\d{1,3})?\s?(\d{3}|\(\d{3}\))\s?\d{3}\s?\d{4}$/;

    return phoneNumberRegex.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Invalid phone number';
  }
}

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PhoneNumberValidator,
    });
  };
}
