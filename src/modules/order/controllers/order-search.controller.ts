import { Controller, ForbiddenException, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { OrderSearchService } from "../services/order-search.service";
import { User } from "../../../common/decorators/user.decorator";
import { UserType } from "../../../common/enums";
import { ResponseStatus } from "../../../common/interfaces/api-response.interface";

@ApiTags('Order Search')
@Controller('orders/search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderSearchController {
    constructor(private readonly orderSearchService: OrderSearchService) { }

    @Get('available/delivery')
    async findAvailableDeliveries(
        @User('userType') userType: UserType,
        @Query('latitude') latitude?: number,
        @Query('longitude') longitude?: number,
        @Query('vehicleType') vehicleType?: string,
    ) {
        if (userType !== UserType.DELIVERY) {
            throw new ForbiddenException('Apenas entregadores podem ver a lista de entregas disponíveis.');
        }

        const radiusKm = vehicleType === 'BIKE' ? 3 : 5;

        const deliveries = await this.orderSearchService.findAvailableDeliveries(latitude, longitude, radiusKm);

        return {
            status: ResponseStatus.SUCCESS,
            message: `${deliveries.length} entregas encontradas na sua região.`,
            data: deliveries
        };
    }
}