import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AppointmentStatus } from "../../../common/enums/appointment-status.enum";
import { Store } from "../../store/entities/store.entity";
import { Customer } from "../../customer/entities/customer.entity";
import { PetService } from "../../catalog/entities/service.entity";
import { Veterinary } from "../../veterinary/entities/veterinary.entity";

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'store_id', type: 'uuid', nullable: true })
    storeId?: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'store_id' })
    store?: Store;

    @Column({ name: 'veterinary_id', type: 'uuid', nullable: true })
    veterinaryId?: string;

    @ManyToOne(() => Veterinary, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'veterinary_id' })
    veterinary?: Veterinary;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'service_id', type: 'uuid' })
    serviceId: string;

    @ManyToOne(() => PetService, { onDelete: 'RESTRICT', nullable: false })
    @JoinColumn({ name: 'service_id' })
    service: PetService;

    @Column({ name: 'scheduled_at', type: 'timestamp' })
    scheduledAt: Date;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        enumName: 'appointment_status',
        default: AppointmentStatus.SCHEDULED,
    })
    status: AppointmentStatus;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;
}
