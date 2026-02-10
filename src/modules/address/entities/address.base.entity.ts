import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";

@Entity('addresses')
@Index(['userId', 'userType'])
@Index(['addressType'])
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'address_type', type: 'varchar', length: 50 })
    addressType: AddressType;

    @Column({ name: 'user_type', type: 'varchar', length: 50 })
    userType: UserType;

    @Column({ type: 'varchar', length: 255 })
    street: string;

    @Column({ type: 'varchar', length: 10 })
    number: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    complement: string | null;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    neighborhood: string;

    @Column({ type: 'varchar', length: 2 })
    state: string;

    @Column({ name: 'zip_code', type: 'varchar', length: 10 })
    zipCode: string;

    @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
    latitude: number | null;

    @Column({ type: 'numeric', precision: 9, scale: 6, nullable: true })
    longitude: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}