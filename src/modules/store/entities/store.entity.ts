import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { AccountStatus } from "../../../common/enums/account-status.enum";
import { UserType } from "../../../common/enums/user-type.enum";
import { StoreBusinessHours } from "./store-business-hour.entity";
import { StoreSpecialHours } from "./store-special-hour.entity";
import { StoreType } from "../../../common/enums/store-type.enum";

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

    @Column({ type: 'enum', enumName: 'store_type', nullable: true })
    store_type: StoreType | null;

    @Column({ length: 20, unique: true, nullable: false })
    cnpj: string;

    @Column({ default: true })
    is_open: boolean;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        enumName: 'account_status',
        default: AccountStatus.PENDING
    })
    status: AccountStatus;

    @Column({ default: false })
    profile_completed: boolean;

    @Column({ length: 500, nullable: true })
    logo_url?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
    rating?: number;

    @Column({ type: 'int', default: 0 })
    total_reviews: number;

    @Column({ type: 'enum', enum: UserType, default: UserType.STORE })
    user_type: UserType;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

    @OneToMany(() => StoreBusinessHours, (businessHours) => businessHours.store, { cascade: true })
    business_hours: StoreBusinessHours[];

    @OneToMany(() => StoreSpecialHours, (specialHours) => specialHours.store)
    special_hours: StoreSpecialHours[];
}
