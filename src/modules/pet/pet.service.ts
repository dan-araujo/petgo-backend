import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePetDTO } from './dto/create-pet.dto';
import { UpdatePetDTO } from './dto/update-pet.dto';
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(customerId: string, dto: CreatePetDTO) {
    const pet = this.petRepository.create({
      ...dto,
      customerId,
    });

    return await this.petRepository.save(pet);
  }

  async findAllByCustomer(customerId: string) {
    return await this.petRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, customerId: string) {
    const pet = await this.petRepository.findOne({ where: { id, customerId } });
    if (!pet) {
      throw new NotFoundException('Pet não encontrado.');
    }
    return pet;
  }

  async update(id: string, customerId: string, dto: UpdatePetDTO) {
    const pet = await this.findOne(id, customerId);
    Object.assign(pet, dto);
    return await this.petRepository.save(pet);
  }

  async updatePhoto(petId: string, customerId: string, file: Express.Multer.File) {
    const pet = await this.findOne(petId, customerId);
    const upload = await this.cloudinaryService.uploadImage(file, 'petgo/pets');
    pet.photoUrl = upload.secure_url;
    return await this.petRepository.save(pet);
  }

  async remove(id: string, customerId: string) {
    const pet = await this.findOne(id, customerId);
    await this.petRepository.softRemove(pet);
    return { message: 'Pet removido com sucesso' };
  }
}
