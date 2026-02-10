import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";
import { AddressInputDTO } from "../../address/dto/address-input.dto";
import { UpdateBaseAddressDTO } from "../../address/dto/update-address.dto";

export class CreateCustomerAddressDTO extends AddressInputDTO {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  addressLabel?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateCustomerAddressDTO extends UpdateBaseAddressDTO {
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  addressLabel?: string;
}
