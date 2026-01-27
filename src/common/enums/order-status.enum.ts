export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    IN_DELIVERY = 'in_delivery',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export type OrderStatusType =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'in_delivery'
    | 'delivered'
    | 'cancelled';