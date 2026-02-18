import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ValidateChangePasswordCodeDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'O código deve ter 6 dígitos' })
    code: string;
}

export class ConfirmChangePasswordDTO {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' })
    newPassword: string;
}