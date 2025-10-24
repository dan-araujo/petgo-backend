import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateCustomerDTO {
  @IsNotEmpty({ message: 'Nome é obrigatório '})
  name: string;

  @IsNotEmpty({ message: 'E-mail é obrigatório'})
  @IsEmail({}, { message: 'E-mail inválido'})
  email: string;

  @IsNotEmpty({ message: 'Telefone é obrigatório'})
  phone: string;

  @IsOptional()
  cpf?: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres'})
  password: string;

}