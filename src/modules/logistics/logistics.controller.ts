import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LogisticsService } from './services/logistics.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpsertLogisticsDTO } from './dto/upsert-logistics.dto';
import { UserType } from '../../common/enums/user-type.enum';

@ApiTags('Logistics Configuration')
@Controller('logistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) { }

  @Post('config')
  upsertConfig(@Req() req: any, @Body() dto: UpsertLogisticsDTO) {
    const userType = req.user.userType === UserType.VETERINARY ? UserType.VETERINARY : UserType.STORE;
    const userId = req.user.id;
    return this.logisticsService.upsert(userId, userType, dto);
  }

  @Get('config')
  getConfig(@Req() req: any) {
    const userType = req.user.userType === UserType.VETERINARY ? UserType.VETERINARY : UserType.STORE;
    const userId = req.user.id;
    return this.logisticsService.findMyConfig(userId, userType);
  }
}
