import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('categories')
export class Category {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column({ length: 100 })
   name: string;

   @Column({ length: 100, unique: true })
   slug: string;

   @CreateDateColumn()
   created_at: Date;
}