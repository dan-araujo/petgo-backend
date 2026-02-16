import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { UserType } from "../../../common/enums/user-type.enum";
import { AccountStatus } from "../../../common/enums/account-status.enum";
import { Order } from "../../order/entities/order.entity";
import { DeliveryAddress } from "./delivery-address.entity";

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

    @Column({ name: 'password_hash' })
    passwordHash: string;

    @Column({ name: 'vehicle_type', length: 20, nullable: true })
    vehicleType?: string;

    @Column({ name: 'vehicle_plate', length: 10, nullable: true })
    vehiclePlate?: string;

    @Column({ name: 'cnh_number', length: 20, nullable: true })
    cnhNumber?: string;

    @Column({ name: 'cnh_valid_until', type: 'date', nullable: true })
    cnhValidUntil?: Date;

    @Column({ name: 'photo_url', type: 'text', nullable: true })
    photoUrl?: string;

    @Column({ name: 'user_type', type: 'enum', enum: UserType, default: UserType.DELIVERY })
    userType: UserType;

    @Column({
        type: 'enum',
        enum: AccountStatus,
        default: AccountStatus.PENDING
    })
    status: AccountStatus;

    @Column({ name: 'profile_completed', type: 'boolean', default: false })
    profileCompleted: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;

    @OneToMany(() => Order, (order) => order.delivery)
    orders: Order[];

    @OneToMany(() => DeliveryAddress, (deliveryAddress) => deliveryAddress.delivery, { cascade: true })
    addresses: DeliveryAddress[];
}
