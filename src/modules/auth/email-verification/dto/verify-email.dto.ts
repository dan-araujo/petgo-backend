import { IsEmail, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { ValidationMessages } from '../../../../common/constants/validation-messages.constants';
import { UserType } from '../../../../common/enums/user-type.enum';


export class VerifyEmailDTO {
    @IsNotEmpty({ message: ValidationMessages.REQUIRED_EMAIL })
    @IsEmail({}, { message: ValidationMessages.INVALID_EMAIL })
    email: string;

    @IsNotEmpty({ message: ValidationMessages.REQUIRED_EMAIL })
    @IsEmail({}, { message: ValidationMessages.INVALID_EMAIL })
    @Length(6, 6, { message: ValidationMessages.VERIFICATION_CODE(6) })
    code: string;

    @IsEnum(UserType)
    userType: UserType;
}