import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserStatus } from "../../../common/enums/user-status.enum";
import { UserType } from "../../../common/enums/user-type.enum";

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ nullable: false })
    password_hash: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ length: 30, nullable: true })
    category: 'PETSHOP' | 'FEED_STORE';

    @Column({ length: 20, unique: true, nullable: false })
    cnpj?: string;

    @Column({ default: true })
    is_open: boolean;

    @Column({ length: 20, default: 'store' })
    role: string;

    @Column({ type: 'enum', enum: UserType, default: UserType.STORE })
    user_type: UserType;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.PENDING
    })
    status: UserStatus;

    @Column({ type: 'boolean', default: false })
    profile_completed: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

}
