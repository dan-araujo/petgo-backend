import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../../../common/enums/user-type.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

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

  @Column({ type: 'varchar', length: 50, nullable: true })
  speciality?: string;

  @Column({ type: 'boolean', default: false })
  home_service: boolean;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column({ length: 20, default: 'veterinary' })
  role: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.VETERINARY })
  user_type: UserType;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  profile_completed: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}
