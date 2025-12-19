export enum UserStatus {
    PENDING = 'pending',
    AWAITING_VERIFICATION = 'awaiting_verification',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DELETED = 'deleted',
}

export type UserStatusType = 'pending' | 'awaiting_verification' | 'active' | 'suspended' | 'deleted';