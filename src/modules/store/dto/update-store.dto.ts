import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDTO } from './create-store.dto';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStoreDTO extends PartialType(CreateStoreDTO) {
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Descrição não pode ter mais de 500 caracteres' })
    description?: string;

    @IsOptional()
    @IsUrl({}, { message: 'URL da logo inválida' })
    logoUrl?: string;

    @IsOptional()
    @IsUrl({}, { message: 'URL do banner inválida' })
    bannerUrl?: string;

    @ApiProperty({ description: 'Valor mínimo do pedido', example: 10.00 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderValue?: number;

    @ApiProperty({ description: 'Usa logística do app?', example: false })
    @IsOptional()
    @IsBoolean()
    usesAppLogistics?: boolean;

    @ApiProperty({ description: 'Define se a loja está aberta ou fechada', example: true })
    @IsOptional()
    @IsBoolean()
    isOpen?: boolean;
}
