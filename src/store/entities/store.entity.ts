import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, nullable: false })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ nullable: false })
    password_hash: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ length: 30, nullable: false })
    category: 'PETSHOP' | 'FEED_STORE';

    @Column({ length: 20, unique: true, nullable: false })
    cnpj?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ length: 50, nullable: true })
    city?: string;

    @Column({ length: 2, nullable: true })
    state?: string;

    @Column({ default: true })
    is_open: boolean;

    @Column({ length: 20, default: 'store' })
    role: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @Column({ length: 10, nullable: true })
    verification_code?: string;

    @Column({ type: 'timestamp', nullable: true })
    code_expires_at?: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

    @Column({
        type: 'enum',
        enum: ['pending', 'awaiting_verification', 'active', 'suspended', 'deleted'],
        default: 'pending'
    })
    status: string;
}
