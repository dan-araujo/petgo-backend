import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderStatus } from "../../../common/enums/order-status.enum";
import { Customer } from "../../customer/entities/customer.entity";
import { Store } from "../../store/entities/store.entity";
import { OrderItem } from "./order-item.entity";
import { ColumnNumericTransformer } from "../../../common/transformer/column-numeric.transformer";
import { DeliveryType } from "../../../common/enums/delivery-type.enum";
import { Delivery } from "../../delivery/entities/delivery.entity";
import { PaymentStatus } from "../../../common/enums/payment-status.enum";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    @Column({ name: 'store_id', type: 'uuid' })
    storeId: string;

    @Column({ name: 'delivery_id', type: 'uuid', nullable: true })
    deliveryId: string;

    @Column({ name: 'delivery_address', type: 'text' })
    deliveryAddress: string;

    @Column({ name: 'delivery_street', type: 'text' })
    deliveryStreet: string

    @Column({ name: 'delivery_number', type: 'text' })
    deliveryNumber: string;

    @Column({ name: 'delivery_city', type: 'text' }) 
    deliveryCity: string;

    @Column({ name: 'delivery_neighborhood', type: 'text', nullable: true }) 
    deliveryNeighborhood: string;

    @Column({ name: 'delivery_zip_code', length: 8 })
    deliveryZipCode: string;

    @Column(
        {
            name: 'delivery_latitude',
            type: 'numeric',
            precision: 10,
            scale: 6,
            transformer: new ColumnNumericTransformer(),
        })
    deliveryLatitude: number;

    @Column(
        {
            name: 'delivery_longitude',
            type: 'numeric',
            precision: 10,
            scale: 6,
            transformer: new ColumnNumericTransformer(),
        })
    deliveryLongitude: number;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    subtotal: number;

    @Column({
        name: 'delivery_fee',
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    deliveryFee: number;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    total: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        enumName: 'order_status',
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({
        name: 'delivery_type',
        type: 'enum',
        enum: DeliveryType,
        enumName: 'delivery_type',
        default: DeliveryType.STORE_OWN,
    })
    deliveryType: DeliveryType;

    @Column({ name: 'payment_transaction_id', nullable: true })
    paymentTransactionId?: string;

    @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    paymentStatus: PaymentStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => Store)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @ManyToOne(() => Delivery)
    @JoinColumn({ name: 'delivery_id' })
    delivery: Delivery;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];
}
