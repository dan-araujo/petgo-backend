import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderStatus } from "../../../common/enums/order-status.enum";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    customer_id: string;

    @Column()
    store_id: string;

    @Column({ type: 'text' })
    delivery_address: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    delivery_fee: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    total: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        enumName: 'order_status',
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at?: Date;
}
