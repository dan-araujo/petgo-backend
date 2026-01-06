import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserType } from "../../../../common/enums/user-type.enum";

@Entity('password_reset_requests')
export class PasswordResetRequest {
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

    @CreateDateColumn({ type: 'timestamptz' })
    updated_at: Date;
}