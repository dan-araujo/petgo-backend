import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDTO } from './dto/create-appointment.dto';
import { UpdateAppointmentDTO } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { Store } from '../store/entities/store.entity';
import { Service } from '../catalog/entities/service.entity';
import { AppointmentStatus, UserType } from '../../common/enums';
import { Veterinary } from '../veterinary/entities/veterinary.entity';
import { Pet } from '../pet/entities/pet.entity';
import { APPOINTMENT_STATUS_DESCRIPTIONS, APPOINTMENT_STATUS_LABELS } from '../../common/constants/appointment-status-labels.constant';
import { APPOINTMENT_TRANSITIONS_RULES } from '../../common/constants/appointment-transitions.constant';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Veterinary)
    private veterinaryRepository: Repository<Veterinary>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) { }

  async create(customerId: string, dto: CreateAppointmentDTO) {
    if (!dto.storeId && !dto.veterinaryId) {
      throw new BadRequestException('Você deve especificar uma loja ou um veterinário.');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt < new Date()) {
      throw new BadRequestException('A data do agendamento não pode estar no passado.');
    }

    const pet = await this.petRepository.findOne({ where: { id: dto.petId, customerId } });
    if (!pet) throw new NotFoundException('Pet não encontrado ou não pertence a esse usuário.');

    const service = await this.serviceRepository.findOne({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException('Serviço não encontrado nesta loja');
    if (!service.isActive) throw new BadRequestException('Este serviço está temporariamente indisponível.');

    if (dto.storeId) {
      const store = await this.storeRepository.findOne({ where: { id: dto.storeId } });
      if (!store) throw new NotFoundException('Loja não encontrada');

      if (service.storeId !== dto.storeId) {
        throw new BadRequestException('O serviço selecionado não pertence a esta loja.');
      }
    } else if (dto.veterinaryId) {
      const vet = await this.veterinaryRepository.findOne({ where: { id: dto.veterinaryId } });
      if (!vet) throw new NotFoundException('Veterinário não encontrado');
      if (service.veterinaryId !== dto.veterinaryId) {
        throw new BadRequestException('O serviço selecionado não pertence a este veterinário.');
      }
    }

    const appointment = this.appointmentRepository.create({
      customerId,
      petId: dto.petId,
      storeId: dto.storeId,
      veterinaryId: dto.veterinaryId,
      serviceId: dto.serviceId,
      scheduledAt,
      status: AppointmentStatus.PENDING,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment)
    return this.formatResponse(savedAppointment);
  }

  async findAll(userId: string, userType: UserType) {
    let whereConditions: any = {};

    if (userType === UserType.STORE) {
      whereConditions.storeId = userId;
    } else if (userType === UserType.VETERINARY) {
      whereConditions.veterinaryId = userId;
    } else if (userType === UserType.CUSTOMER) {
      whereConditions.customerId = userId;
    }

    const appointments = await this.appointmentRepository.find({
      where: whereConditions,
      relations: ['service', 'store', 'veterinary', 'customer', 'pet'],
      order: { scheduledAt: 'ASC' },
    });

    return appointments.map(app => this.formatResponse(app));
  }


  async findOne(id: string, userId: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['service', 'store', 'veterinary', 'customer', 'pet'],
    });
    if (!appointment) throw new NotFoundException('Agendamento não encontrado.');

    const isParticipant =
      appointment.customerId === userId ||
      appointment.storeId === userId ||
      appointment.veterinaryId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('Você não tem permissão para visualizar este agendamento.');
    }

    return appointment;
  }

  async getDetails(id: string, userId: string) {
    const appointment = await this.findOne(id, userId);
    return this.formatResponse(appointment);
  }

  async updateStatus(id: string, userId: string, userType: UserType, newStatus: AppointmentStatus) {
    const appointment = await this.findOne(id, userId);

    const allowedTransitions = APPOINTMENT_TRANSITIONS_RULES[appointment.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Transição inválida: Não é possível mudar de '${APPOINTMENT_STATUS_LABELS[appointment.status]}' para '${APPOINTMENT_STATUS_LABELS[newStatus]}'.}`
      );
    }

    if (userType === UserType.CUSTOMER && newStatus !== AppointmentStatus.CANCELLED) {
      throw new ForbiddenException('Clientes só podem alterar o status para CANCELADO.');
    }

    appointment.status = newStatus
    const updateAppointment = await this.appointmentRepository.save(appointment);

    return this.formatResponse(updateAppointment);
  }

  async remove(id: string, userId: string, userType: UserType) {
    const appointment = await this.findOne(id, userId);

    if (userType === UserType.CUSTOMER) {
      throw new ForbiddenException('Clientes só podem cancelar agendamentos.');
    }

    await this.appointmentRepository.softRemove(appointment);
    return { message: 'Agendamento removido com sucesso.' };
  }

  private formatResponse(appointment: Appointment) {
    return {
      ...appointment,
      statusLabel: APPOINTMENT_STATUS_LABELS[appointment.status],
      statusDescription: APPOINTMENT_STATUS_DESCRIPTIONS[appointment.status],
    };
  }
}
