import { Test, TestingModule } from '@nestjs/testing';
import { VeterinaryController } from './veterinary.controller';
import { VeterinaryService } from './veterinary.service';

describe('VeterinaryController', () => {
  let controller: VeterinaryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeterinaryController],
      providers: [VeterinaryService],
    }).compile();

    controller = module.get<VeterinaryController>(VeterinaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
