import { Test, TestingModule } from '@nestjs/testing';
import { VeterinaryService } from './veterinary.service';

describe('VeterinaryService', () => {
  let service: VeterinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VeterinaryService],
    }).compile();

    service = module.get<VeterinaryService>(VeterinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
