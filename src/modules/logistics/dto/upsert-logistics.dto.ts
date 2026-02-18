import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class UpsertLogisticsDTO {
    @ApiProperty({ example: 20.00 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minOrderValue?: number;

    @ApiProperty({ example: 5.00 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    deliveryFee?: number;

    @ApiProperty({ example: true })
    @IsOptional()
    @IsBoolean()
    isFreeDelivery?: boolean;

    @ApiProperty({ example: 100.00 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    freeDeliveryMinOrderValue?: number;

    @ApiProperty({ example: false })
    @IsOptional()
    @IsBoolean()
    usesAppLogistics?: boolean;
}
