import { IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class ConfirmChangePasswordDTO {
    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;

    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' })
    newPassword: string;
}