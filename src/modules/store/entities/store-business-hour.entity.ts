import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "./store.entity";

@Entity('store_business_hours')
export class StoreBusinessHours {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Store, (store) => store.businessHours)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'store_id', type: 'uuid' })
    storeId: string;

    @Column({ name: 'day_of_week', type: 'int' })
    dayOfWeek: number;

    @Column({ name: 'opens_at', type: 'time' })
    opensAt: string;

    @Column({ name: 'closes_at', type: 'time' })
    closesAt: string;

    @Column({ name: 'is_closed', default: false, nullable: true })
    isClosed: boolean;
}
