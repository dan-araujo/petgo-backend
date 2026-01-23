import { IsBoolean, IsNumber, IsOptional } from "class-validator";
import { AddressInputDTO } from "../../address/dto/address-input.dto";
import { UpdateBaseAddressDTO } from "../../address/dto/update-address.dto";

export class CreateDeliveryAddressDTO extends AddressInputDTO {
    @IsOptional()
    @IsBoolean()
    is_current_location?: boolean;

    @IsOptional()
    @IsNumber()
    heading?: number;

    @IsOptional()
    @IsNumber()
    accuracy?: number;

    @IsOptional()
    @IsNumber()
    speed?: number;
}

export class UpdateDeliveryAddressDTO extends UpdateBaseAddressDTO {
    @IsOptional()
    @IsBoolean()
    is_current_location?: boolean;

    @IsOptional()
    @IsNumber()
    heading?: number;

    @IsOptional()
    @IsNumber()
    accuracy?: number;

    @IsOptional()
    @IsNumber()
    speed?: number;
}