import { IsBoolean, IsOptional } from "class-validator";
import { AddressInputDTO } from "../../address/dto/address-input.dto";
import { UpdateBaseAddressDTO } from "../../address/dto/update-address.dto";

export class CreateDeliveryAddressDTO extends AddressInputDTO {
    @IsOptional()
    @IsBoolean()
    isCurrentLocation?: boolean;
}

export class UpdateDeliveryAddressDTO extends UpdateBaseAddressDTO {
    @IsOptional()
    @IsBoolean()
    isCurrentLocation?: boolean;
}