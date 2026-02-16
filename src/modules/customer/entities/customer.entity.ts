import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../../../common/enums/user-type.enum';
import { AccountStatus } from '../../../common/enums/account-status.enum';
import { CustomerAddress } from './customer-address.entity';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ unique: true, length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'varchar', unique: true, length: 14, nullable: true })
    cpf?: string;

    @Column({ name: 'password_hash', nullable: true })
    passwordHash: string;

    @Column({ name: 'user_type', type: 'enum', enum: UserType, default: UserType.CUSTOMER })
    userType: UserType;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.PENDING
    })
    status: AccountStatus;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;

    @OneToMany(() => CustomerAddress, (customerAddress) => customerAddress.customer, { cascade: true })
    addresses: CustomerAddress[];

}