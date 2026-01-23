import { IsEnum, IsString, Length } from "class-validator";
import { UserType } from "../../../../common/enums/user-type.enum";

export class ForgotPasswordDTO {
    @IsString()
    resetToken: string;

    @IsString()
    @Length(8, 72)
    newPassword: string;

    @IsString()
    @Length(8, 72)
    confirmPassword: string;

    @IsEnum(UserType)
    userType: UserType;
}