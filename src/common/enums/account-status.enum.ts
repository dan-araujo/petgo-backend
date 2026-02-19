export enum AccountStatus {
    AWAITING_VERIFICATION = 'awaiting_verification',
    PENDING = 'pending',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DELETED = 'deleted',
}

export type AccountStatusType = 'awaiting_verification' | 'pending'  | 'active' | 'suspended' | 'deleted';