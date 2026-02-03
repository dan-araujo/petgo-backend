import { IsBoolean, IsDateString, IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateSpecialHourDTO {
    @IsNotEmpty()
    @IsDateString()
    specific_date: string;

    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato HH:mm' })
    opens_at: string;

    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato HH:mm' })
    closes_at: string;

    @IsBoolean()
    is_closed: boolean;
}