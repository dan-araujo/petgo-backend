import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from "class-validator";

export class RequestEmailChangeDTO {
    @IsNotEmpty()
    @IsEmail({}, { message: 'E-mail inválido' })
    newEmail: string;
}

export class ConfirmEmailChangeDTO {
    @IsNotEmpty()
    @IsEmail()
    newEmail: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 6)
    code: string;
}