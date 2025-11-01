import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ValidationMessages } from '../../common/constants/validation-messages';

export class CreateCustomerDTO {
  @IsNotEmpty({ message: ValidationMessages.REQUIRED_NAME })
  @IsString()
  @MinLength(3, { message: ValidationMessages.SHORT_NAME })
  name: string;

  @IsEmail({}, { message: ValidationMessages.INVALID_EMAIL })
  email: string;

  @IsNotEmpty({ message: ValidationMessages.REQUIRED_PHONE })
  phone: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsNotEmpty({ message: ValidationMessages.REQUIRED_PASSWORD })
  @IsString()
  @MinLength(6, { message: ValidationMessages.SHORT_PASSWORD(6) })
  password: string;

}