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
import { ColumnNumericTransformer } from '../../../common/transformer/column-numeric.transformer';

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

  @Column({
    name: 'profile_picture_url',
    type: 'varchar',
    length: 500,
    nullable: true
  })
  profilePictureUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({
    name: 'consultation_fee_base',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer()
  })
  consultationFeeBase?: number;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer()
  })
  rating?: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => VeterinaryAddress, (veterinaryAddress) => veterinaryAddress.veterinary, { cascade: true })
  addresses: VeterinaryAddress[];
}
