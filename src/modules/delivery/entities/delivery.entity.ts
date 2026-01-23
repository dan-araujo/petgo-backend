import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserType } from "../../../common/enums/user-type.enum";
import { UserStatus } from "../../../common/enums/user-status.enum";

@Entity('delivery')
export class Delivery {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ length: 20 })
    phone: string;

    @Column({ nullable: true, length: 14 })
    cpf?: string;

    @Column()
    password_hash: string;

    @Column({ length: 20, nullable: true })
    vehicle_type?: string;

    @Column({ length: 10, nullable: true })
    vehicle_plate?: string;

    @Column({ length: 20, nullable: true })
    cnh_number?: string;

    @Column({ type: 'date', nullable: true })
    cnh_valid_until?: Date;

    @Column({ type: 'text', nullable: true })
    photo_url?: string;

    @Column({ length: 20, default: 'delivery' })
    role: string;

    @Column({ type: 'enum', enum: UserType, default: UserType.DELIVERY })
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
