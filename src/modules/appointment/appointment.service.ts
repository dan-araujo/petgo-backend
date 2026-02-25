import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDTO } from './dto/create-appointment.dto';
import { UpdateAppointmentDTO } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { Store } from '../store/entities/store.entity';
import { Service } from '../catalog/entities/service.entity';
import { AppointmentStatus, UserType } from '../../common/enums';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async create(customerId: string, dto: CreateAppointmentDTO) {
    const scheduledAt = new Date(dto.scheduledAt);
    if(scheduledAt < new Date()) {
      throw new BadRequestException('A data do agendamento não pode estar no passado.');
    }

    const store = await this.storeRepository.findOne({ where: { id: dto.storeId } });
    if(!store) throw new NotFoundException('Loja não encontrada');

    const service = await this.serviceRepository.findOne({ where: { id: dto.serviceId } });
    if(!service) throw new NotFoundException('Serviço não encontrado nesta loja');
    if(service.storeId !== dto.storeId) {
      throw new BadRequestException('O serviço selecionado não pertence a esta loja.');
    }
    if(!service.isActive) throw new BadRequestException('Este serviço está temporariamente indisponível.');

    const appointment = this.appointmentRepository.create({
      customerId,
      storeId: dto.storeId,
      serviceId: dto.serviceId,
      veterinaryId: dto.veterinaryId,
      scheduledAt: new Date(dto.scheduledAt),
      status: AppointmentStatus.SCHEDULED,
    });

    return await this.appointmentRepository.save(appointment);
  }

  async findAll(userId: string, userType: UserType) {
    let whereConditions: any = {};

    if(userType === UserType.STORE) {
      whereConditions.storeId = userId;
    } else if(userType === UserType.CUSTOMER) {
      whereConditions.customerId = userId;
    }

    return await this.appointmentRepository.find({ 
      where: whereConditions,
      relations: ['service', 'store', 'customer'],
      order: { scheduledAt: 'ASC' }, 
    });
  }


  async findOne(id: string, userId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['service', 'store', 'customer'],
    });
    if(!appointment) throw new NotFoundException('Agendamento não encontrado.');
    if(appointment.customerId !== userId && appointment.storeId !== userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar esse agendaimento.');
    }
    
    return appointment;
  }

  async updateStatus(id: string, userId: string, userType: UserType, newStatus: AppointmentStatus) {
    const appointment = await this.findOne(id, userId);
    
    if(userType === UserType.CUSTOMER && newStatus !== AppointmentStatus.CANCELLED) {
      throw new ForbiddenException('Clientes só podem alterar o status para CANCELADO.');
    }

    appointment.status = newStatus
    return await this.appointmentRepository.save(appointment);
  }

  remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
