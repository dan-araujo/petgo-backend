import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Customer } from "../../customer/entities/customer.entity";
import { Store } from "../../store/entities/store.entity";
import { Veterinary } from "../../veterinary/entities/veterinary.entity";
import { Order } from "../../order/entities/order.entity";
import { Appointment } from "../../appointment/entities/appointment.entity";

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @Column({ name: 'is_visible', default: true })
    isVisible: boolean;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ name: 'customer_id', type: 'uuid', nullable: true })
    storeId?: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'store_id' })
    store?: Store;

    @Column({ name: 'veterinary_id', type: 'uuid', nullable: true })
    veterinaryId?: string;

    @ManyToOne(() => Veterinary, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'veterinary_id' })
    veterinary?: Veterinary;

    @Column({ name: 'order_id', type: 'uuid', nullable: true })
    orderId?: string;

    @ManyToOne(() => Order, { nullable: true })
    @JoinColumn({ name: 'order_id' })
    order?: Order;

    @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
    appointmentId?: string;

    @ManyToOne(() => Appointment, { nullable: true })
    @JoinColumn({ name: 'appointment_id' })
    appointment?: Appointment;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

}


