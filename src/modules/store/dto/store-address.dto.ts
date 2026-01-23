import { IsBoolean, IsOptional } from "class-validator";
import { AddressInputDTO } from "../../address/dto/address-input.dto";
import { UpdateBaseAddressDTO } from "../../address/dto/update-address.dto";

export class CreateStoreAddressDTO extends AddressInputDTO {
    @IsOptional()
    @IsBoolean()
    is_main_address?: boolean;
}

export class UpdateStoreAddressDTO extends UpdateBaseAddressDTO {
    @IsOptional()
    @IsBoolean()
    is_main_address?: boolean;
}