import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "./store.entity";

@Entity('store_special_hours')
export class StoreSpecialHours {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Store, (store) => store.special_hours)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ type: 'uuid' })
    store_id: string;

    @Column({ type: 'date' })
    specific_date: string;

    @Column({ type: 'time', nullable: true })
    opens_at: string | null;

    @Column({ type: 'time', nullable: true })
    closes_at: string | null;

    @Column({ default: false, nullable: true })
    is_closed: boolean;
}
