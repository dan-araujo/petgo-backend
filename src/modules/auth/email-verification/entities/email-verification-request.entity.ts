import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserType } from "../../../../common/enums/user-type.enum";

@Entity('email_verification_requests')
@Index(['email', 'user_type'])
export class EmailVerificationRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column({ type: 'enum', enum: UserType })
    user_type: UserType;

    @Column()
    code_hash: string;

    @Column({ type: 'timestamptz' })
    expires_at: Date;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'timestamptz', nullable: true })
    locked_until: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    used_at: Date | null;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    last_sent_at: Date | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}