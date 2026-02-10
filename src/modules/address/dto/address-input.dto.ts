import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class AddressInputDTO {
  @IsString()
  @MaxLength(255)
  street: string;

  @IsString()
  @Length(1, 10)
  number: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  complement?: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  neighborhood: string;

  @IsString()
  @Length(2, 2)
  state: string;

  @IsString()
  @Length(8, 8, { message: 'O CEP deve ter 8 dígitos numéricos' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  zipCode: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}
