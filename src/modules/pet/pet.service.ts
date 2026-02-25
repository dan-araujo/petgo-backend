import { Injectable } from '@nestjs/common';
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
   ) {}

  create(createPetDto: CreatePetDTO) {
    return 'This action adds a new pet';
  }

  findAll() {
    return `This action returns all pet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pet`;
  }

  update(id: number, updatePetDto: UpdatePetDTO) {
    return `This action updates a #${id} pet`;
  }

  async updatePhoto(petId: string, file: Express.Multer.File) {
    const upload = await this.cloudinaryService.uploadImage(file, 'petgo/pets');
    const photoUrl = upload.secure_url;
    await this.petRepository.findOne
  }

  remove(id: number) {
    return `This action removes a #${id} pet`;
  }
}
