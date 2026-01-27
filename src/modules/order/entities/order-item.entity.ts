import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    order_id: string;

    @Column()
    product_id: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    unit_price: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    subtotal: number;
}
