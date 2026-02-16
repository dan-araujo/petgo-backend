import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { Veterinary } from "./veterinary.entity";

@Entity('veterinary_addresses')
@Index(['isMainLocation'])
export class VeterinaryAddress {
    @PrimaryColumn('uuid')
    id: string;

    @OneToOne(() => Address, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    address: Address;

    @Column({ name: 'veterinary_id' })
    veterinaryId: string;

    @ManyToOne(() => Veterinary, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'veterinary_id' })
    veterinary: Veterinary;

    @Column({ name: 'is_main_location', type: 'boolean', default: false, nullable: true })
    isMainLocation: boolean;
}