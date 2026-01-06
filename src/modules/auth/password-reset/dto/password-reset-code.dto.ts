import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { UserType } from "../../../../common/enums/user-type.enum";

export class PasswordResetCodeDTO {
    @IsEmail()
    email: string;

    @IsEnum(UserType)
    userType: UserType;

    @IsString()
    @Length(6, 6)
    code: string;
}