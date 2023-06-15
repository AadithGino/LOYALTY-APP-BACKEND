import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'weakPassword', async: false })
export class WeakPasswordValidator implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    // Minimum length check
    if (password.length < 8) {
      return false;
    }

    // Complexity requirements check
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return false;
    }

    // Common passwords check
    const commonPasswords = ['password', '123456', 'qwerty']; // Add more common passwords to this array
    if (commonPasswords.includes(password)) {
      return false;
    }

    // Blacklist check
    const blacklist = ['password123', 'admin123']; // Add more passwords to the blacklist
    if (blacklist.includes(password)) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password is too weak. It should have a minimum length of 8 characters and include at least one uppercase letter, one lowercase letter, one digit, and one special character. It should not be a common password or blacklisted.';
  }
}
