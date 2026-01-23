import { Type } from 'class-transformer';
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
  @Length(2, 2)
  state: string;

  @IsString()
  @Length(8, 10)
  zip_code: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}
