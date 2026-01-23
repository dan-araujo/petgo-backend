import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { CustomerAddressService } from "../services/customer-address.service";
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from "../dto/customer-address.dto";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('addresses/customer')
export class CustomerAddressController {
    constructor(private readonly service: CustomerAddressService) { }

    @Post()
    create(@Req() req, @Body(ValidationPipe) dto: CreateCustomerAddressDTO) {
        return this.service.create(dto, {
            user_id: req.user.id,
            user_type: UserType.CUSTOMER,
            address_type: AddressType.CUSTOMER,
        });
    }

    @Patch(':id')
    update(@Req() req, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateCustomerAddressDTO) {
        const customerId = req.user.id;
        return this.service.update(id, dto, customerId);
    }

    @Delete(':id')
    delete(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
        const userId = req.user.id;
        return this.service.delete(id, userId);
    }

    @Get()
    findAll(@Req() req) {
        const customerId = req.user.id;
        return this.service.findAllByUser(customerId);
    }

    @Get('main')
    findMainAddress(@Req() req) {
        const customerId = req.user.id;
        return this.service.findMainAddress(customerId);
    }
}