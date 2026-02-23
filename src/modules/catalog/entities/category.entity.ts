import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "../../store/entities/store.entity";

@Entity('categories')
@Index(['storeId', 'slug'], { unique: true, where: '"store_id" IS NOT NULL' })
@Index(['veterinaryId', 'slug'], { unique: true, where: '"veterinary_id" IS NOT NULL' })
export class Category {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({ length: 100 })
   name: string;

   @Column({ length: 100 })
   slug: string;

   @Column({ name: 'is_active', default: true })
   isActive: boolean;

   @ManyToOne(() => Store, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'store_id' })
   store: Store;

   @Column({ name: 'store_id', type: 'uuid' })
   storeId: string;

   @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
   createdAt: Date;

   @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
   updatedAt: Date;

   @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
   deletedAt?: Date;
}