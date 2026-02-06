import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './services/logistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsConfig } from './entities/logistics-config.entity';
import { GeolocationService } from './services/geolocation.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogisticsConfig])],
  controllers: [LogisticsController],
  providers: [LogisticsService, GeolocationService],
  exports: [LogisticsService, GeolocationService],
})
export class LogisticsModule { }
