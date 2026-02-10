import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ColumnNumericTransformer } from "../../../common/transformer/column-numeric.transformer";

@Entity('system_logistics_config')
export class SystemLogisticsConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'app_base_fee', type: 'numeric', transformer: new ColumnNumericTransformer() })
    appBaseFee: number;

    @Column({ name: 'app_km_fee', type: 'numeric', transformer: new ColumnNumericTransformer() })
    appKmFee: number;

    @Column({ name: 'app_max_radius_km', type: 'numeric', transformer: new ColumnNumericTransformer() })
    appMaxRadiusKm: number;

    @Column({ name: 'driver_split_percentage', type: 'int', default: 80 })
    driverSplitPercentage: number;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}