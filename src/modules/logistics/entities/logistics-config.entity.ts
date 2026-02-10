import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "../../store/entities/store.entity";
import { Veterinary } from "../../veterinary/entities/veterinary.entity";
import { ColumnNumericTransformer } from "../../../common/transformer/column-numeric.transformer";

@Entity('logistics_configs')
export class LogisticsConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'radius_km', type: 'numeric', precision: 10, scale: 2, default: 5, transformer: new ColumnNumericTransformer() })
    // Raio máximo de atendimento em quilômetros
    radiusKm: number;

    @Column({ name: 'base_fee', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    // Taxa fixa de saída/visita cobrada independente da distância
    baseFee: number;

    @Column({ name: 'km_fee', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    // Valor cobrado por cada quilômetro de distância
    kmFee: number;

    @Column({ name: 'min_value', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    // Valor mínimo para viabilizar a logística (Pedido Mín. ou Consulta Mín.).
    minValue: number;

    @Column({ name: 'lead_time_min', type: 'int', default: 15 })
    // Tempo de preparo ou prontidão em minutos antes do deslocamento
    leadTimeMin: number;

    @OneToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'store_id', type: 'uuid', nullable: true })
    storeId: string;

    @OneToOne(() => Veterinary, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'veterinary_id' })
    veterinary: Veterinary;

    @Column({ name: 'veterinary_id', type: 'uuid', nullable: true })
    veterinaryId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
