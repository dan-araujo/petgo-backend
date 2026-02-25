export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    READY_FOR_PICKUP = 'READY_FOR_PICKUP',
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