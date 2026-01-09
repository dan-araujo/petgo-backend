import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ValidationMessages } from '../../../../common/constants/validation-messages.constants';
import { UserType } from '../../../../common/enums/user-type.enum';


export class ResendVerificationCodeDTO {
  @IsNotEmpty({ message: ValidationMessages.REQUIRED_EMAIL })
  @IsEmail({}, { message: ValidationMessages.INVALID_EMAIL })
  email: string;

  @IsNotEmpty({ message: ValidationMessages.REQUIRED_USER_TYPE })
  @IsEnum(UserType, { message: ValidationMessages.INVALID_USER_TYPE })
  userType: UserType;
}
