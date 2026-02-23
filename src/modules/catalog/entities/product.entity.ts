import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "../../store/entities/store.entity";
import { Category } from "./category.entity";
import { ColumnNumericTransformer } from "../../../common/transformer/column-numeric.transformer";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'numeric',
        precision: 10,
        scale: 2,
        transformer: new ColumnNumericTransformer()
    })
    price: number;

    @Column({ name: 'stock_quantity', type: 'int' })
    stockQuantity: number;

    @Column({ name: 'image_url', nullable: true })
    imageUrl: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({
        length: 50,
        nullable: true,
        comment: 'Stock Keeping Unit - Identificador único de inventário/estoque'
    })
    sku?: string;

    @Column({
        length: 50,
        nullable: true,
        comment: 'Código de barras do produto (EAN, UPC, etc.)'
    })
    barcode?: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'store_id', type: 'uuid' })
    storeId: string;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ name: 'category_id', type: 'uuid' })
    categoryId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date;
}