import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AppointmentStatus } from "../../../common/enums/appointment-status.enum";

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    store_id: string;

    @Column()
    customer_id: string;

    @Column()
    service_id: string;

    @Column({ type: 'timestamp' })
    scheduled_at: Date;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        enumName: 'appointment_status',
        default: AppointmentStatus.SCHEDULED,
    })
    status: AppointmentStatus;

    @CreateDateColumn()
    created_at: Date;
}
