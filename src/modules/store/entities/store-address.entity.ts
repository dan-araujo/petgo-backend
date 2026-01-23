import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";

@Entity('store_addresses')
@Index(['is_main_address'])
export class StoreAddress {
    @PrimaryColumn('uuid')
    id: string;

    @OneToOne(() => Address, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    address: Address;

    @Column({ type: 'boolean', default: false })
    is_main_address: boolean;
}