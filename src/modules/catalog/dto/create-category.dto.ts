import { IsBoolean, IsNotEmpty, IsString, MaxLength, IsOptional } from "class-validator";

export class CreateCategoryDTO {
    @IsNotEmpty({ message: 'O nome da categoria é obrigatório' })
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}