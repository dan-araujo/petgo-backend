import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsString, Matches, Max, Min, ValidateNested } from "class-validator";

export class BusinessHourDTO {
    @IsInt()
    @Min(0)
    @Max(6)
    day_of_week: number;

    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Horário de abertura deve estar no formato HH:MM (ex: 08:30)',
    })
    opens_at: string;

    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Horário de abertura deve estar no formato HH:MM (ex: 18:00)',
    })
    closes_at: string;

    @IsBoolean()
    is_closed: boolean;
}

export class ManageBusinessHoursDTO {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BusinessHourDTO)
    hours: BusinessHourDTO[];
}