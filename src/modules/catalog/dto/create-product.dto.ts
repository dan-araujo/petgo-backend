import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Min } from "class-validator";

export class CreateProductDTO {
    @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty({ message: 'O preço é obrigatório' })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0, { message: 'O preço não pode ser negativo' })
    price: number;

    @IsNotEmpty({ message: 'A quantidade em estoque é obrigatória' })
    @IsNumber()
    @Min(0, { message: 'A quantidade em estoque não pode ser negativa' })
    stockQuantity: number;

    @IsOptional()
    @IsUrl({}, { message: 'A URL da imagem é inválida' })
    imageUrl?: string;

    @IsNotEmpty({ message: 'A categoria é obrigatória' })
    @IsUUID('4', { message: 'ID da categoria inválido' })
    categoryId: string;

}