import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    user_type: 'store' | 'customer' | 'delivery' | 'veterinary';

    @Column({ nullable: false })
    user_id: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}