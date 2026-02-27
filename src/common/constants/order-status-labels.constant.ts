import { OrderStatus } from "../enums/order-status.enum";

export const OrderStatusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pendente',
    [OrderStatus.CONFIRMED]: 'Confirmado',
    [OrderStatus.PREPARING]: 'Em Preparo',
    [OrderStatus.READY_FOR_PICKUP]: 'Pronto para Retirada',
    [OrderStatus.IN_DELIVERY]: 'Em Rota de Entrega',
    [OrderStatus.DELIVERED]: 'Concluído',
    [OrderStatus.CANCELLED]: 'Cancelado',
    [OrderStatus.REFUNDED]: 'Estorno de Pagamento',
}