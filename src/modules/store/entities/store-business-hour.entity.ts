import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "./store.entity";

@Entity('store_business_hours')
export class StoreBusinessHours {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Store, (store) => store.businessHours)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ type: 'uuid' })
    store_id: string;

    @Column({ type: 'int' })
    day_of_week: number;

    @Column({ type: 'time' })
    opens_at: string;

    @Column({ type: 'time' })
    closes_at: string;

    @Column({ default: false, nullable: true })
    is_closed: boolean;
}
