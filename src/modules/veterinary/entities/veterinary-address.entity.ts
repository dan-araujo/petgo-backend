import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";

@Entity('veterinary_addresses')
@Index(['is_main_location'])
export class VeterinaryAddress {
    @PrimaryColumn('uuid')
    id: string;

    @OneToOne(() => Address, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    address: Address;

    @Column({ type: 'boolean', default: false, nullable: true })
    is_main_location: boolean;
}