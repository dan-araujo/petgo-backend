import { IsBoolean, IsDateString, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateSpecialHourDTO {
    @IsNotEmpty()
    @IsDateString()
    specificDate: string;

    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato HH:mm' })
    opensAt: string;

    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato HH:mm' })
    closesAt: string;

    @IsBoolean()
    isClosed: boolean;
}