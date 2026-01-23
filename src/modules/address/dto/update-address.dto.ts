import { PartialType } from '@nestjs/mapped-types';
import { AddressInputDTO } from './address-input.dto';

export class UpdateBaseAddressDTO extends PartialType(AddressInputDTO) {}