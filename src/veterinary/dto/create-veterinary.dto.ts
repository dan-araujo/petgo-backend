import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ValidationMessages } from '../../common/constants/validation-messages';

export enum VeterinaryCategory {
    SOLO = 'SOLO',
    CLINIC = 'CLINIC',
}

export class CreateVeterinaryDTO {
    @IsNotEmpty({ message: ValidationMessages.REQUIRED_NAME })
    @IsString()
    @MinLength(3, { message: ValidationMessages.SHORT_NAME })
    name: string;

    @IsEmail({}, { message: ValidationMessages.INVALID_EMAIL })
    email: string;

    @IsNotEmpty({ message: ValidationMessages.REQUIRED_PHONE })
    phone: string;

    @IsEnum(VeterinaryCategory, { message: ValidationMessages.INVALID_CATEGORY })
    category: VeterinaryCategory;

    @IsNotEmpty({ message: ValidationMessages.REQUIRED_PASSWORD })
    @IsString()
    @MinLength(6, { message: ValidationMessages.SHORT_PASSWORD(6) })
    password: string;
}

