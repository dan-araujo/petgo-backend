import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { DeliveryAddressService } from "../services/delivery-address.service";
import { CreateDeliveryAddressDTO, UpdateDeliveryAddressDTO } from "../dto/delivery-address.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";
import { ApiBearerAuth } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller('addresses/delivery')
@ApiBearerAuth()
export class DeliveryAddressController {
    constructor(private readonly service: DeliveryAddressService) { }

    @Post()
    create(@Req() req, @Body(ValidationPipe) dto: CreateDeliveryAddressDTO) {
        return this.service.create(dto, {
            userId: req.user.id,
            userType: UserType.DELIVERY,
            addressType: AddressType.DELIVERY
        });
    }

    @Patch(':id')
    update(@Req() req, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateDeliveryAddressDTO) {
        return this.service.update(id, dto, req.user.id);
    }

    @Delete(':id')
    delete(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id, req.user.id);
    }

    @Get()
    findAll(@Req() req) {
        const deliveryId = req.user.id;
        return this.service.findAllByUser(deliveryId);
    }

    @Get('main')
    findCurrentLocation(@Req() req) {
        const deliveryId = req.user.id;
        return this.service.findCurrentLocation(deliveryId);
    }
}