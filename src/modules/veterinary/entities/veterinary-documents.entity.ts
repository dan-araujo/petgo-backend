import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Veterinary } from './veterinary.entity';
import { RegistrationStatus } from '../../../common/enums/registration-status.enum';

export enum VeterinaryDocumentType {
    CPF = 'CPF',
    CNPJ = 'CNPJ',
}

@Entity('veterinary_documents')
export class VeterinaryDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', unique: true })
    veterinary_id: string;

    @OneToOne(() => Veterinary)
    @JoinColumn({ name: 'veterinary_id' })
    veterinary: Veterinary;

    @Column({
        type: 'varchar',
        length: 20,
        default: VeterinaryDocumentType.CPF,
    })
    document_type: VeterinaryDocumentType;

    @Column({ type: 'varchar', length: 20, unique: true })
    document_number: string;

    @Column({ type: 'varchar', length: 20 })
    crmv: string;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    verification_date?: Date;

    @Column({ type: 'varchar', length: 50, nullable: true })
    verification_method?: string;

    @Column({
        type: 'varchar',
        length: 50,
        default: RegistrationStatus.PENDING,
    })
    registration_status: RegistrationStatus;

    @Column({ type: 'varchar', length: 500, nullable: true })
    document_front_url?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    document_back_url?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    proof_of_address_url?: string;

    @Column({ type: 'text', nullable: true })
    rejection_reason?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'timestamp', nullable: true })
    rejected_at?: Date;

    @Column({ type: 'timestamp', nullable: true })
    expired_at?: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
