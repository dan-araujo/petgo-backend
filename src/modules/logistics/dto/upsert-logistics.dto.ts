import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class UpsertLogisticsDTO {
    @ApiProperty({ example: 20.00 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderValue?: number;

    // CORREÇÃO: Alterado de deliveryFee para baseFee
    @ApiProperty({ example: 5.00 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    baseFee?: number; 

    @ApiProperty({ example: true })
    @IsOptional()
    @IsBoolean()
    isFreeDelivery?: boolean;

    @ApiProperty({ example: 100.00 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    freeDeliveryAbove?: number; 

    @ApiProperty({ example: false })
    @IsOptional()
    @IsBoolean()
    usesAppLogistics?: boolean;

    @IsOptional() @IsNumber() radiusKm?: number;
    @IsOptional() @IsNumber() kmFee?: number;
    @IsOptional() @IsNumber() leadTimeMin?: number;
    @IsOptional() @IsNumber() avgDeliveryTime?: number;
}