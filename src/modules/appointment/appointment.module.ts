import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Store } from '../store/entities/store.entity';
import { Service } from '../catalog/entities/service.entity';
import { Veterinary } from '../veterinary/entities/veterinary.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Pet } from '../pet/entities/pet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Store, Veterinary, Customer, Pet, Service])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService]
})
export class AppointmentModule {}
