import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SystemLogisticsConfig } from "../entities/system-logistics-config.entity";
import { Repository } from "typeorm";
import { LogisticsConfig } from "../entities/logistics-config.entity";
import { GeolocationService } from "./geolocation.service";
import { DeliveryType } from "../../../common/enums/delivery-type.enum";
import { StoreAddress } from "../../store/entities/store-address.entity";
import { Store } from "../../store/entities/store.entity";
import { Address } from "../../address/entities/address.base.entity";


@Injectable()
export class LogisticsCalculatorService {
    constructor(
        @InjectRepository(LogisticsConfig)
        private readonly logisticsConfigRepository: Repository<LogisticsConfig>,
        @InjectRepository(SystemLogisticsConfig)
        private readonly systemLogisticsConfigRepo: Repository<SystemLogisticsConfig>,
        private readonly geoService: GeolocationService,
    ) { }

    async calculateLogistics(
        store: Store,
        storeInfo: StoreAddress,
        clientInfo: Address,
        orderSubtotal: number
    ) {
        const distanceKm = this.geoService.calculateDistance(
            Number(storeInfo.address.latitude),
            Number(storeInfo.address.longitude),
            Number(clientInfo.latitude),
            Number(clientInfo.longitude),
        );

        if (store.usesAppLogistics) {
            return this.calculateAppDelivery(distanceKm);
        } else {
            return this.calculateStoreDelivery(store.id, distanceKm, orderSubtotal);
        }
    }

    async calculateAppDelivery(distanceKm: number) {
        const systemConfig = await this.systemLogisticsConfigRepo.findOne({
            where: {},
            order: { updatedAt: 'DESC' }
        });

        if (!systemConfig) {
            throw new InternalServerErrorException('Erro crítico: Configuração do sistema não encontrada.');
        }

        if (distanceKm > systemConfig.appMaxRadiusKm) {
            throw new BadRequestException(`Endereço muito distante para entregadores parceiros`);
        }

        const deliveryFee = Number(systemConfig.appBaseFee) + (distanceKm * Number(systemConfig.appKmFee));
        return { deliveryFee, distanceKm, deliveryType: DeliveryType.APP_PARTNER };
    }

    async calculateStoreDelivery(storeId: string, distanceKm: number, orderSubtotal: number) {
        const config = await this.logisticsConfigRepository.findOne({
            where: { storeId: storeId },
        });

        if (!config) {
            throw new BadRequestException('Essa loja não configurou suas regras de entrega ainda.');
        }

        if (orderSubtotal < config.minValue) {
            throw new BadRequestException(`O pedido mínimo para esta loja é de R$ ${config.minValue.toFixed(2)}`);
        }

        if (distanceKm > config.radiusKm) {
            throw new BadRequestException(`Fora da área de entrega da loja (${config.radiusKm}km).`);
        }

        const deliveryFee = Number(config.baseFee) + (distanceKm * Number(config.kmFee));
        return { deliveryFee, distanceKm, deliveryType: DeliveryType.STORE_OWN };
    }
}