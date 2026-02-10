import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './services/logistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsConfig } from './entities/logistics-config.entity';
import { GeolocationService } from './services/geolocation.service';
import { LogisticsCalculatorService } from './services/logistics-calculator.service';
import { SystemLogisticsConfig } from './entities/system-logistics-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogisticsConfig, SystemLogisticsConfig])],
  controllers: [LogisticsController],
  providers: [LogisticsService, GeolocationService, LogisticsCalculatorService],
  exports: [LogisticsService, GeolocationService, LogisticsCalculatorService],
})
export class LogisticsModule { }
