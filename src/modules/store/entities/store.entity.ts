import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { AccountStatus } from "../../../common/enums/account-status.enum";
import { UserType } from "../../../common/enums/user-type.enum";
import { StoreBusinessHours } from "./store-business-hour.entity";
import { StoreSpecialHours } from "./store-special-hour.entity";
import { StoreType } from "../../../common/enums/store-type.enum";
import { ColumnNumericTransformer } from "../../../common/transformer/column-numeric.transformer";
import { StoreAddress } from "./store-address.entity";
import { LogisticsConfig } from "../../logistics/entities/logistics-config.entity";

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ name: 'password_hash', nullable: false })
    passwordHash: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ name: 'store_type', type: 'enum', enumName: 'store_type', nullable: true })
    storeType: StoreType | null;

    @Column({ length: 20, unique: true, nullable: false })
    cnpj: string;

    @Column({ name: 'is_open', default: true })
    isOpen: boolean;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        enumName: 'account_status',
        default: AccountStatus.PENDING
    })
    status: AccountStatus;

    @Column({ name: 'profile_completed', default: false })
    profileCompleted: boolean;

    @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
    logoUrl?: string;

    @Column({ name: 'banner_url', type: 'varchar', length: 255, nullable: true })
    bannerUrl?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true, transformer: new ColumnNumericTransformer() })
    rating?: number;

    @Column({ name: 'total_reviews', type: 'int', default: 0 })
    totalReviews: number;

    @Column({ name: 'user_type', type: 'enum', enum: UserType, default: UserType.STORE })
    userType: UserType;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;

    @OneToMany(() => StoreBusinessHours, (businessHours) => businessHours.store, { cascade: true })
    businessHours: StoreBusinessHours[];

    @OneToMany(() => StoreSpecialHours, (specialHours) => specialHours.store)
    specialHours: StoreSpecialHours[];

    @OneToMany(() => StoreAddress, (storeAddress) => storeAddress.store, { cascade: true })
    addresses: StoreAddress[];

    @OneToOne(() => LogisticsConfig, (logisticsConfig) => logisticsConfig.store)
    logisticsConfig: LogisticsConfig;
}
