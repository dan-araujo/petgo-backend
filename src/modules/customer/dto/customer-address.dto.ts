import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";
import { AddressInputDTO } from "../../address/dto/address-input.dto";
import { UpdateBaseAddressDTO } from "../../address/dto/update-address.dto";

export class CreateCustomerAddressDTO extends AddressInputDTO {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  address_label?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateCustomerAddressDTO extends UpdateBaseAddressDTO {
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address_label?: string;
}
