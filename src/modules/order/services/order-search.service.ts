import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, IsNull, Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { DeliveryType, OrderStatus } from "../../../common/enums";

@Injectable()
export class OrderSearchService {
    constructor(@InjectRepository(Order) private readonly orderRepo: Repository<Order>) { }

    async findAvailableDeliveries(latitude?: number, longitude?: number, radiusKm: number = 5): Promise<Order[]> {
        const query = this.orderRepo.createQueryBuilder('order')
            .innerJoinAndSelect('order.store', 'store')
            .where('order.deliveryType = :type', { type: DeliveryType.APP_PARTNER })
            .andWhere('order.status IN (:...statuses)', {
                statuses: [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP]
            })
            .andWhere('order.deliveryId IS NULL');

        if (latitude && longitude) {
            const radiusMeters = radiusKm * 1000;
            query.andWhere(
                `ST_Distance(
                  ST_MakePoint(order.delivery_longitude, order.delivery_latitude)::geography,
                  ST_MakePoint(:longitude, :latitude)::geography
                ) <= :radius`,
                { latitude, longitude, radius: radiusMeters }
            );
        }

        query.orderBy('order.createdAt', 'ASC');

        return query.getMany();
    }
}