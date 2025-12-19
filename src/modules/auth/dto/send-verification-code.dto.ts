import { IsEmail, IsNotEmpty } from 'class-validator';
import { ValidationMessages } from '../../../common/constants/validation-messages';

export class ResendVerificationCodeDTO {
  @IsNotEmpty({ message: ValidationMessages.REQUIRED_EMAIL })
  @IsEmail({}, { message: ValidationMessages.INVALID_EMAIL })
  email: string;
}
