import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('carts')
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    customer_id: string;

    @Column()
    product_id: string;

    @Column({ type: 'int' })
    quantity: number;
}