import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "./store.entity";

@Entity('petshops')
export class Petshop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Store, (store) => store.petshop, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'store_id', type: 'uuid' })
    storeId: string;

    @Column({ name: 'accepts_appointments', default: true })
    acceptsAppointments: boolean;

    @Column({ name: 'average_service_duration_minutes', type: 'int', default: 60, nullable: true })
    averageServiceDurationMinutes: number;

    @Column({ name: 'total_appointments', type: 'int', default: 0 })
    totalAppointments: number;

    @Column({ name: 'completed_appointments', type: 'int', default: 0 })
    completedAppointments: number;

    @Column({ name: 'cancelled_appointments', type: 'int', default: 0 })
    cancelledAppointments: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;
}
