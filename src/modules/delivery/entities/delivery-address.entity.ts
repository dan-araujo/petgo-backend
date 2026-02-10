import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { Delivery } from "./delivery.entity";

@Entity('delivery_addresses')
@Index(['isCurrentLocation'])
export class DeliveryAddress {
    @PrimaryColumn('uuid')
    id: string;

    @OneToOne(() => Address, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    address: Address;

    @Column({ name: 'delivery_id' })
    deliveryId: string;

    @ManyToOne(() => Delivery, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'delivery_id' })
    delivery: Delivery;

    @Column({ name: 'is_current_location', type: 'boolean', default: false })
    isCurrentLocation: boolean;
}