import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDTO } from './dto/create-appointment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { AppointmentStatus, UserType } from '../../common/enums';

@ApiTags('Appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  @Post()
  create(@User('id') customerId: string, @Body(ValidationPipe) dto: CreateAppointmentDTO) {
    return this.appointmentService.create(customerId, dto);
  }

  @Get()
  findAll(@User('id') userId: string, @User('userType') userType: UserType) {
    return this.appointmentService.findAll(userId, userType);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('id') userId: string) {
    return this.appointmentService.getDetails(id, userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @User('id') userId: string,
    @User('userType') userType: UserType,
    @Body('status') newStatus: AppointmentStatus) {
    return this.appointmentService.updateStatus(id, userId, userType, newStatus);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('id') userId: string, @User('userType') userType: UserType,) {
    return this.appointmentService.remove(id, userId, userType);
  }
}
