import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ unique: true, length: 20, nullable: true })
    phone?: string;

    @Column({ unique: true, length: 14, nullable: true })
    cpf?: string;

    @Column({ nullable: true })
    password_hash: string;

    @Column({ length: 10, nullable: true })
    verification_code?: string;

    @Column({ type: 'timestamp', nullable: true })
    code_expires_at?: Date;

    @Column({ length: 20, default: 'customer' })
    role: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    // Para exclusão lógica no futuro
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at?: Date;

}