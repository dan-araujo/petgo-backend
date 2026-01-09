import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('veterinaries')
export class Veterinary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ unique: true, length: 20 })
  phone: string;

  @Column()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: ['SOLO', 'CLINIC'],
    default: 'SOLO',
  })
  category: 'SOLO' | 'CLINIC';

  @Column({ type: 'varchar', unique: true, length: 14, nullable: true })
  cpf?: string;

  @Column({ type: 'varchar', unique: true, length: 20, nullable: true })
  cnpj?: string;

  @Column({ type: 'varchar', unique: true, length: 20, nullable: true })
  crmv?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  speciality?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city?: string;

  @Column({ type: 'char', length: 2, nullable: true })
  state?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'boolean', default: false })
  home_service: boolean;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column({ length: 20, default: 'veterinary' })
  role: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'awaiting_verification', 'active', 'suspended', 'deleted'],
    default: 'pending',
  })
  status: 'pending' | 'awaiting_verification' | 'active' | 'suspended' | 'deleted';

  @Column({ type: 'boolean', default: false })
  profile_completed: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
