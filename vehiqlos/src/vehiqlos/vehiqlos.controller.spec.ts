import { Test, TestingModule } from '@nestjs/testing';
import { VehiqlosController } from './vehiqlos.controller';
import { VehiqlosService } from './vehiqlos.service';

describe('VehiqlosController', () => {
  let controller: VehiqlosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiqlosController],
      providers: [VehiqlosService],
    }).compile();

    controller = module.get<VehiqlosController>(VehiqlosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
