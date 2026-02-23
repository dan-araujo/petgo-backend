import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { StoreAddressService } from "../services/store-address.service";
import { CreateStoreAddressDTO, UpdateStoreAddressDTO } from "../dto/store-address.dto";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { User } from "../../../common/decorators/user.decorator";

@UseGuards(JwtAuthGuard)
@Controller('addresses/store')
@ApiBearerAuth()
export class StoreAddressController {
    constructor(private readonly service: StoreAddressService) { }

    @Post()
    create(@User('id') storeId: string, @Body(ValidationPipe) dto: CreateStoreAddressDTO) {
        return this.service.create(dto, {
            userId: storeId,
            userType: UserType.STORE,
            addressType: AddressType.STORE,
        });
    }

    @Patch(':id')
    update(@User('id') storeId: string, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateStoreAddressDTO) {
        return this.service.update(id, dto, storeId);
    }

    @Delete(':id')
    delete(@User('id') storeId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id, storeId);
    }

    @Get()
    findAll(@User('id') storeId: string) {
        return this.service.findAllByUser(storeId);
    }

    @Get('main')
    findMain(@User('id') storeId: string) {
        return this.service.findMainAddress(storeId);
    }
}
