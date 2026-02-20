import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "./store.entity";

@Entity('store_special_hours')
export class StoreSpecialHours {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Store, (store) => store.specialHours)
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'store_id', type: 'uuid' })
    storeId: string;

    @Column({ name: 'specific_date', type: 'date' })
    specificDate: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string | null;

    @Column({ name: 'opens_at', type: 'time', nullable: true })
    opensAt: string | null;

    @Column({ name: 'closes_at', type: 'time', nullable: true })
    closesAt: string | null;

    @Column({ name: 'is_closed', default: false, nullable: true })
    isClosed: boolean;
}
