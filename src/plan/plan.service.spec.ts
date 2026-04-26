import { Test, TestingModule } from '@nestjs/testing';
import { PlanService } from './plan.service';
import { PlanRepository } from './plan.repository';

describe('PlanService', () => {
  let service: PlanService;
  let repository: PlanRepository;

  const mockPlan = { id: 1, name: 'Pro', slug: 'pro' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        {
          provide: PlanRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockPlan),
            getAll: jest.fn().mockResolvedValue([mockPlan]),
            getById: jest.fn().mockResolvedValue(mockPlan),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<PlanService>(PlanService);
    repository = module.get<PlanRepository>(PlanRepository);
  });

  it('should create a plan', async () => {
    const dto = { name: 'Pro' } as any;
    const result = await service.create(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockPlan);
  });

  it('should find all plans', async () => {
    const result = await service.getAll();
    expect(repository.getAll).toHaveBeenCalled();
    expect(result).toEqual([mockPlan]);
  });

  it('should find a plan by id', async () => {
    const result = await service.getById(1);
    expect(repository.getById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockPlan);
  });

  it('should update a plan', async () => {
    const dto = { name: 'New Pro' };
    await service.update(1, dto);
    expect(repository.update).toHaveBeenCalledWith(1, dto);
  });

  it('should delete a plan', async () => {
    await service.delete(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});