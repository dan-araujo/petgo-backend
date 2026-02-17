import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserType } from "../../../../common/enums/user-type.enum";

@Entity('email_verification_requests')
@Index(['email', 'userType'])
export class EmailVerificationRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({ name: 'user_type', type: 'enum', enum: UserType })
    userType: UserType;

    @Column({ name: 'code_hash' })
    codeHash: string;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt: Date;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
    lockedUntil: Date | null;

    @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
    usedAt: Date | null;

    @Column({ name: 'last_sent_at', type: 'timestamptz', default: () => 'now()' })
    lastSentAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;
}