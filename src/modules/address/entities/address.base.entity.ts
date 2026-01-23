import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";

@Entity('addresses')
@Index(['user_id', 'user_type'])
@Index(['address_type'])
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    user_id: string;

    @Column({ type: 'varchar', length: 50 })
    address_type: AddressType;

    @Column({ type: 'varchar', length: 50 })
    user_type: UserType;

    @Column({ type: 'varchar', length: 255 })
    street: string;

    @Column({ type: 'varchar', length: 10 })
    number: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    complement: string | null;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 2 })
    state: string;

    @Column({ type: 'varchar', length: 10 })
    zip_code: string;

    @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
    latitude: number | null;

    @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
    longitude: number | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}