import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";
import { ValidationMessages } from "../../common/constants/validation-messages";

export class CreateStoreDTO {
    @IsNotEmpty({ message: ValidationMessages.REQUIRED_NAME })
    @IsString()
    @MinLength(3, { message: ValidationMessages.SHORT_NAME })
    name: string;

    @IsEmail({}, { message: ValidationMessages.INVALID_EMAIL })
    email: string;

    @IsNotEmpty({ message: ValidationMessages.REQUIRED_PASSWORD })
    @IsString()
    @MinLength(6, { message: ValidationMessages.SHORT_PASSWORD(6) })
    password: string;

    @IsOptional()
    phone?: string;

    @IsEnum(['PETSHOP', 'FEED_STORE'], { message: ValidationMessages.INVALID_CATEGORY })
    category: 'PETSHOP' | 'FEED_STORE';

    @IsOptional()
    @IsString()
    @Matches(/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, {
        message: ValidationMessages.INVALID_CNPJ,
    })
    cnpj?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @Length(2, 2)
    state?: string;

}
