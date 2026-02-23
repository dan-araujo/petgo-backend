import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { CustomerAddressService } from "../services/customer-address.service";
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from "../dto/customer-address.dto";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { User } from "../../../common/decorators/user.decorator";

@UseGuards(JwtAuthGuard)
@Controller('addresses/customer')
@ApiBearerAuth()
export class CustomerAddressController {
    constructor(private readonly service: CustomerAddressService) { }

    @Post()
    create(@User('id') customerId: string, @Body(ValidationPipe) dto: CreateCustomerAddressDTO) {
        return this.service.create(dto, {
            userId: customerId,
            userType: UserType.CUSTOMER,
            addressType: AddressType.CUSTOMER,
        });
    }

    @Patch(':id')
    update(@User('id') customerId: string, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateCustomerAddressDTO) {
        return this.service.update(id, dto, customerId);
    }

    @Delete(':id')
    delete(@User('id') customerId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id, customerId);
    }

    @Get()
    findAll(@User('id') customerId: string) {
        return this.service.findAllByUser(customerId);
    }

    @Get('main')
    findMainAddress(@User('id') customerId: string) {
        return this.service.findMainAddress(customerId);
    }
}