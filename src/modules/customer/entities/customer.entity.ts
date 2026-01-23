import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../../../common/enums/user-type.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

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

    @Column({ nullable: true })
    password_hash: string;

    @Column({ length: 20, default: 'customer' })
    role: string;

    @Column({ type: 'enum', enum: UserType, default: UserType.CUSTOMER })
    user_type: UserType;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.PENDING
    })
    status: UserStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

}