import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreatePetServiceDTO {
    @IsNotEmpty({ message: 'O nome do serviço é obrigatório' })
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty({ message: 'O preço é obrigatório' })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'O preço não pode ser negativo' })
    price: number;

    @IsNotEmpty({ message: 'A duração em minutos é obrigatória' })
    @IsInt({ message: 'A duração deve ser um número inteiro (minutos)' })
    @Min(10, { message: 'A duração mínima é de 10 minutos' })
    durationMinutes: number;

    @IsNotEmpty({ message: 'A categoria é obrigatória' })
    @IsUUID('4', { message: 'ID da categoria inválido' })
    categoryId: string;

}