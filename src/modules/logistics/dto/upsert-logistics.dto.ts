import { IsNumber, IsOptional, Min } from "class-validator";

export class UpsertLogisticsDTO {
    @IsNumber()
    @Min(0, { message: 'O raio de entrega deve ser positivo' })
    radius_km: number;

    @IsNumber()
    @Min(0, { message: 'A taxa base não pode ser negativa' })
    base_fee: number;

    @IsNumber()
    @Min(0, { message: 'A taxa por km não pode ser negativa' })
    km_fee: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    min_value?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    lead_time_min?: number;
}
