import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { PetSize, PetSpecies } from "../../../common/enums/pets.enum";

export class CreatePetDTO {
    @IsNotEmpty({ message: 'O nome do pet é obrigatório.' })
    @IsString()
    @MaxLength(100)
    name: string;

    @IsEnum(PetSpecies, { message: 'A espécie do pet é inválida.' })
    species: PetSpecies;

    @IsString()
    @IsOptional()
    breed?: string;

    @IsEnum(PetSize, { message: 'Porte do pet inválido.' })
    size: PetSize;

    @IsOptional()
    @IsDateString({}, { message: 'Data de nascimento inválida.' })
    birthDate?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsString()
    @IsOptional()
    photoUrl?: string;
}
