import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDTO } from './create-store.dto';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateStoreDTO extends PartialType(CreateStoreDTO) {
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Descrição não pode ter mais de 500 caracteres' })
    description?: string;

    @IsOptional()
    @IsUrl({}, { message: 'URL da logo inválida' })
    logo_url?: string;

    @IsOptional()
    @IsUrl({}, { message: 'URL do banner inválida' })
    banner_url?: string;
}
