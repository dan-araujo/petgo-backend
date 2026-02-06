import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "../../store/entities/store.entity";
import { Veterinary } from "../../veterinary/entities/veterinary.entity";

@Entity('logistics_configs')
export class LogisticsConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 5 })
    // Raio máximo de atendimento em quilômetros
    radius_km: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    // Taxa fixa de saída/visita cobrada independente da distância
    base_fee: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    // Valor cobrado por cada quilômetro de distância
    km_fee: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    // Valor mínimo para viabilizar a logística (Pedido Mín. ou Consulta Mín.).
    min_value: number;

    @Column({ type: 'int', default: 15 })
    // Tempo de preparo ou prontidão em minutos antes do deslocamento
    lead_time_min: number;

    @OneToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ type: 'uuid', nullable: true })
    store_id: string;

    @OneToOne(() => Veterinary, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'veterinary_id' })
    veterinary: Veterinary;

    @Column({ type: 'uuid', nullable: true })
    veterinary_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
