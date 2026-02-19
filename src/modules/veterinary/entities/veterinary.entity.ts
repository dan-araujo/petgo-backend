import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../../../common/enums/user-type.enum';
import { AccountStatus } from '../../../common/enums/account-status.enum';
import { VeterinaryAddress } from './veterinary-address.entity';

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

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['SOLO', 'CLINIC'],
    default: 'SOLO',
  })
  category: 'SOLO' | 'CLINIC';

  @Column({ type: 'varchar', length: 50, nullable: true })
  speciality?: string;

  @Column({ name: 'home_service', type: 'boolean', default: false })
  homeService: boolean;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ name: 'user_type', type: 'enum', enum: UserType, default: UserType.VETERINARY })
  userType: UserType;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.AWAITING_VERIFICATION
  })
  status: AccountStatus;

  @Column({ name: 'profile_completed', type: 'boolean', default: false })
  profileCompleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => VeterinaryAddress, (veterinaryAddress) => veterinaryAddress.veterinary, { cascade: true })
  addresses: VeterinaryAddress[];
}
