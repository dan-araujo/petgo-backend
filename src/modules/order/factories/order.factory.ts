import { BadRequestException, Injectable } from "@nestjs/common";
import { OrderItemDTO } from "../dto/create-order.dto";
import { Product } from "../../catalog/entities/product.entity";
import { OrderItem } from "../entities/order-item.entity";

@Injectable()
export class OrderFactory {
    buildOrderItems(itemsDTO: OrderItemDTO[], products: Product[]) {
        let productsTotal = 0;
        const orderItems = itemsDTO.map(itemDTO => {
            const product = products.find(product => product.id === itemDTO.productId);

            if (!product) {
                throw new BadRequestException(`Produto ${itemDTO.productId} não encontrado.`);
            }

            const price = Number(product.price);
            const itemTotal = Number((price * itemDTO.quantity).toFixed(2));
            productsTotal += itemTotal;

            const orderItem = new OrderItem();
            orderItem.productId = product.id;
            orderItem.quantity = itemDTO.quantity;
            orderItem.unitPrice = price;
            orderItem.subtotal = itemTotal;

            return orderItem;
        });


        return { orderItems, productsTotal: Number(productsTotal.toFixed(2)) };
    }
}