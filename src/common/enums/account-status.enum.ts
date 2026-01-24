export enum AccountStatus {
    PENDING = 'pending',
    AWAITING_VERIFICATION = 'awaiting_verification',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DELETED = 'deleted',
}

export type AccountStatusType = 'pending' | 'awaiting_verification' | 'active' | 'suspended' | 'deleted';