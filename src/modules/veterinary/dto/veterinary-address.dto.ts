import { IsBoolean, IsOptional } from "class-validator";
import { AddressInputDTO } from "../../address/dto/address-input.dto";
import { UpdateBaseAddressDTO } from "../../address/dto/update-address.dto";

export class CreateVeterinaryAddressDTO extends AddressInputDTO {
    @IsOptional()
    @IsBoolean()
    is_main_location?: boolean;
}

export class UpdateVeterinaryAddressDTO extends UpdateBaseAddressDTO {
    @IsOptional()
    @IsBoolean()
    is_main_location?: boolean;
}