import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { StoreHoursService } from "../services/store-hours.service";
import { CreateSpecialHourDTO } from "../dto/special-hours.dto";
import { ManageBusinessHoursDTO } from "../dto/business-hours.dto";

@ApiTags('Stores | Hours')
@Controller('stores')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoreHoursController {
    constructor(private readonly storeHoursService: StoreHoursService) { }

    @Get('business-hours')
    async getBusinessHours(@Req() req: any) {
        const storeId = req.user.id;
        return await this.storeHoursService.findBusinessHours(storeId);
    }

    @Get('special-hours')
    async findAllSpecialHours(@Req() req: any) {
        const storeId = req.user.id;
        return await this.storeHoursService.findAllSpecialHours(storeId);
    }

    @Put('business-hours')
    async updateBusinessHours(@Req() req: any, @Body() dto: ManageBusinessHoursDTO) {
        const storeId = req.user.id;
        return await this.storeHoursService.updateBusinessHours(storeId, dto);
    }

    @Delete('business-hours/reset')
    async resetBusinessHours(@Req() req: any) {
        const storeId = req.user.id;
        return await this.storeHoursService.resetBusinessHours(storeId);
    }

    @Post('special-hours')
    async setSpecialHours(@Req() req: any, @Body() dto: CreateSpecialHourDTO) {
        const storeId = req.user.id;
        return await this.storeHoursService.updateSpecialHours(storeId, dto);
    }

    @Delete('special-hours/:id')
    async removeSpecialHour(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        const storeId = req.user.id;
        return await this.storeHoursService.removeSpecialHour(storeId, id);
    }

}