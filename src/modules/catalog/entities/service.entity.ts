import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "../../store/entities/store.entity";
import { Category } from "./category.entity";
import { Veterinary } from "../../veterinary/entities/veterinary.entity";
import { ColumnNumericTransformer } from "../../../common/transformer/column-numeric.transformer";

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    name: string;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    price: number;

    @Column({ name: 'duration_minutes', type: 'int' })
    durationMinutes: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string;

    @Column({ name: 'store_id', type: 'uuid', nullable: true })
    storeId?: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'store_id' })
    store?: Store;

    @Column({ name: 'veterinary_id', type: 'uuid', nullable: true })
    veterinaryId?: string;

    @ManyToOne(() => Veterinary, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'veterinary_id' })
    veterinary?: Veterinary;

    @Column({ name: 'category_id', type: 'uuid' })
    categoryId: string;

    @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;

}