import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { SelectStoreTypeDTO } from "../dto/select-store-type.dto";
import { StoreOnboardingService } from "../services/store-onboarding.service";

@ApiTags('Store | Onboarding')
@Controller('stores/onboarding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoreOnboardingController {
    constructor(private readonly storeOnboardingService: StoreOnboardingService) { }

    @Patch('select-type')
    async selectStoreType(@Req() req: any, @Body() dto: SelectStoreTypeDTO) {
        const storeId = req.user.id;
        return await this.storeOnboardingService.selectStoreType(storeId, dto);
    }

    @Patch('complete')
    async complete(@Req() req: any) {
        const storeId = req.user.id;
        return await this.storeOnboardingService.completeOnboarding(storeId);
    }
}