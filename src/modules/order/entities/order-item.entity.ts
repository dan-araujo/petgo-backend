import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ColumnNumericTransformer } from "../../../common/transformer/column-numeric.transformer";
import { Order } from "./order.entity";
import { Product } from "../../catalog/entities/product.entity";

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'order_id' })
    orderId: string;

    @Column({ name: 'product_id' })
    productId: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({
        name: 'unit_price',
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    unitPrice: number;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    subtotal: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}
