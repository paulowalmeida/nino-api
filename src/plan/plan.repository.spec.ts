import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/services/prisma/prisma.service';
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service';
import { PlanRepository } from './plan.repository';

describe('PlanRepository', () => {
  let repository: PlanRepository;
  let prismaService: PrismaService;
  let prismaErrorService: PrismaErrorService;

  const mockPlan = { id: 1, name: 'Pro', slug: 'pro', price: 197 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanRepository,
        {
          provide: PrismaService,
          useValue: {
            plan: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: PrismaErrorService,
          useValue: { handleError: jest.fn() },
        },
      ],
    }).compile();

    repository = module.get<PlanRepository>(PlanRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService);
  });

  it('should create a plan successfully', async () => {
    jest.spyOn(prismaService.plan, 'create').mockResolvedValue(mockPlan as any);
    const result = await repository.create({ name: 'Pro' } as any);
    expect(result).toEqual(mockPlan);
  });

  it('should call handleError when create throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.plan, 'create').mockRejectedValue(error);
    await repository.create({ name: 'Pro' } as any);
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });

  it('should find all plans', async () => {
    jest.spyOn(prismaService.plan, 'findMany').mockResolvedValue([mockPlan] as any);
    const result = await repository.getAll();
    expect(result).toEqual([mockPlan]);
  });

  it('should call handleError when findAll throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.plan, 'findMany').mockRejectedValue(error);
    await repository.getAll();
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });

  it('should find a plan by id', async () => {
    jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(mockPlan as any);
    const result = await repository.getById(1);
    expect(result).toEqual(mockPlan);
  });

  it('should throw NotFoundException and call handleError when getById finds nothing', async () => {
    jest.spyOn(prismaService.plan, 'findUnique').mockResolvedValue(null);
    await repository.getById(1);
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(expect.any(NotFoundException));
  });

  it('should update a plan successfully', async () => {
    jest.spyOn(prismaService.plan, 'update').mockResolvedValue(mockPlan as any);
    await repository.update(1, { name: 'New Pro' });
    expect(prismaService.plan.update).toHaveBeenCalled();
  });

  it('should call handleError when update throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.plan, 'update').mockRejectedValue(error);
    await repository.update(1, { name: 'New Pro' });
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });

  it('should delete a plan successfully', async () => {
    jest.spyOn(prismaService.plan, 'delete').mockResolvedValue(mockPlan as any);
    await repository.delete(1);
    expect(prismaService.plan.delete).toHaveBeenCalled();
  });

  it('should call handleError when delete throws an error', async () => {
    const error = new Error('db error');
    jest.spyOn(prismaService.plan, 'delete').mockRejectedValue(error);
    await repository.delete(1);
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error);
  });
});