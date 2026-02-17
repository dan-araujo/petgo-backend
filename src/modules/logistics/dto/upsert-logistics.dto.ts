import { IsNumber, IsOptional, Min } from "class-validator";

export class UpsertLogisticsDTO {
    @IsNumber()
    @Min(0, { message: 'O raio de entrega deve ser positivo' })
    radiusKm: number;

    @IsNumber()
    @Min(0, { message: 'A taxa base não pode ser negativa' })
    baseFee: number;

    @IsNumber()
    @Min(0, { message: 'A taxa por km não pode ser negativa' })
    kmFee: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minValue?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    leadTimeMin?: number;
}
