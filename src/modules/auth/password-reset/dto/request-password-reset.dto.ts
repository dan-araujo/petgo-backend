import { IsEmail, IsEnum } from "class-validator";
import { UserType } from "../../../../common/enums/user-type.enum";

export class RequestPasswordResetDTO {
    @IsEmail()
    email: string;

    @IsEnum(UserType)
    userType: UserType;
}