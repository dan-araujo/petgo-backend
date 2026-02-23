import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { DeliveryAddressService } from "../services/delivery-address.service";
import { CreateDeliveryAddressDTO, UpdateDeliveryAddressDTO } from "../dto/delivery-address.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";
import { ApiBearerAuth } from "@nestjs/swagger";
import { User } from "../../../common/decorators/user.decorator";

@UseGuards(JwtAuthGuard)
@Controller('addresses/delivery')
@ApiBearerAuth()
export class DeliveryAddressController {
    constructor(private readonly service: DeliveryAddressService) { }

    @Post()
    create(@User('id') deliveryId: string, @Body(ValidationPipe) dto: CreateDeliveryAddressDTO) {
        return this.service.create(dto, {
            userId: deliveryId,
            userType: UserType.DELIVERY,
            addressType: AddressType.DELIVERY
        });
    }

    @Patch(':id')
    update(@User('id') deliveryId: string, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateDeliveryAddressDTO) {
        return this.service.update(id, dto, deliveryId);
    }

    @Delete(':id')
    delete(@User('id') deliveryId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id, deliveryId);
    }

    @Get()
    findAll(@User('id') deliveryId: string) {
        return this.service.findAllByUser(deliveryId);
    }

    @Get('main')
    findCurrentLocation(@User('id') deliveryId: string) {
        return this.service.findCurrentLocation(deliveryId);
    }
}