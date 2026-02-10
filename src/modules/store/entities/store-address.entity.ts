import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { Store } from "./store.entity";

@Entity('store_addresses')
@Index(['isMainAddress'])
export class StoreAddress {
    @PrimaryColumn('uuid')
    id: string;

    @OneToOne(() => Address, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    address: Address;

    @Column({ name: 'store_id' })
    storeId: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'is_main_address', type: 'boolean', default: false })
    isMainAddress: boolean;
}