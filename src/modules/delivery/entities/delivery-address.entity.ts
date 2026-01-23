import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";

@Entity('delivery_addresses')
@Index(['is_current_location'])
export class DeliveryAddress {
    @PrimaryColumn('uuid')
    id: string;

    @OneToOne(() => Address, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    address: Address;

    @Column({ type: 'boolean', default: false })
    is_current_location: boolean;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    heading: number | null;

    @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
    accuracy: number | null;

    @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
    speed: number | null;
}