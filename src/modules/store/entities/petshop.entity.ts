import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "./store.entity";

@Entity('petshops')
export class Petshop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ type: 'uuid' })
    store_id: string;

    @Column({ default: true })
    accepts_appointments: boolean;

    @Column({ type: 'int', default: 60, nullable: true })
    average_service_duration_minutes: number;

    @Column({ type: 'int', default: 0 })
    total_appointments: number;

    @Column({ type: 'int', default: 0 })
    completed_appointments: number;

    @Column({ type: 'int', default: 0 })
    cancelled_appointments: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at?: Date;
}
