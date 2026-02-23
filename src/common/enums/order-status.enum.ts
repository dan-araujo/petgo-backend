export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    IN_DELIVERY = 'IN_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export type OrderStatusType =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'IN_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED';