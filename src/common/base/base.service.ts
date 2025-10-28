import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseService<T extends ObjectLiteral> {
    constructor(protected readonly repo: Repository<T>) { }

    protected async checkUnique(
        data: Partial<T>,
        fields: (keyof T)[],
        excludeId?: string,
        messages?: Record<string, string>
    ): Promise<void> {
        const whereConditions = fields.map((f) => ({ [f]: (data as any)[f] }));
        const existing = await this.repo.findOne({ where: whereConditions as any });

        if (!existing) return;
        if (excludeId && (existing as any).id === excludeId) return;

        for (const field of fields) {
            if ((data as any)[field] && existing[field] === (data as any)[field]) {
                const msg = messages?.[field as string] || `Duplicate ${String(field)}`
                throw new ConflictException(msg);
            }
        }
    }

    protected async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    protected generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}