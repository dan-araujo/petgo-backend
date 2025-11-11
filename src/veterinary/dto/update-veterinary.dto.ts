import { PartialType } from '@nestjs/mapped-types';
import { CreateVeterinaryDTO } from './create-veterinary.dto';

export class UpdateVeterinaryDTO extends PartialType(CreateVeterinaryDTO) {}
