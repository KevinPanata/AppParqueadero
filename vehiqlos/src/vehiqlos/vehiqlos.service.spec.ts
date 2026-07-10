import { Test, TestingModule } from '@nestjs/testing';
import { VehiqlosService } from './vehiqlos.service';

describe('VehiqlosService', () => {
  let service: VehiqlosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiqlosService],
    }).compile();

    service = module.get<VehiqlosService>(VehiqlosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
