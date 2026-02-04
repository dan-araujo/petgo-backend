import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Store } from "../../store/entities/store.entity";

@Entity('categories')
@Index(['store_id', 'slug'], { unique: true })
export class Category {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({ length: 100 })
   name: string;

   @Column({ length: 100 })
   slug: string;

   @Column({ default: true })
   is_active: boolean;

   @ManyToOne(() => Store, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'store_id' })
   store: Store;

   @Column('uuid')
   store_id: string;

   @CreateDateColumn()
   created_at: Date;

   @UpdateDateColumn()
   updated_at: Date;
}