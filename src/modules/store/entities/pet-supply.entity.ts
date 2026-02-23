import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "./store.entity";

@Entity('pet_supplies')
export class PetSupply {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Store, (store) => store.petSupply, { onDelete: 'CASCADE' })
    store: Store;

    @Column({ name: 'store_id', type: 'uuid' })
    storeId: string;

    @Column({ name: 'low_stock_alert_threshold', type: 'int', default: 5, comment: 'Alerta quando o estoque está baixo' })
    lowStockAlertThreshold: string;

    @Column({ name: 'total_products', type: 'int', default: 0 })
    totalProducts: number;

    @Column({ name: 'manage_inventory_automatically', default: true })
    manageInventoryAutomatically: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;
}