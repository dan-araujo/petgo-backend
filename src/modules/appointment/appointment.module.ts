import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Store } from '../store/entities/store.entity';
import { Service } from '../catalog/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Store, Service])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService]
})
export class AppointmentModule {}
