import { Test, TestingModule } from '@nestjs/testing'

import { Plan } from '@prisma/client'

import { PlanRepository } from './plan.repository'
import { PlanService } from './plan.service'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanResponse } from './types/plan.response.type'
import { PlanWithType } from './types/plan-with-type.type'

describe(PlanService.name, () => {
  let service: PlanService

  const mockPlanWithType: PlanWithType = {
    id: 'plan-1',
    name: 'Pro',
    slug: 'pro',
    price: 99.9 as unknown as Plan['price'],
    typeId: 'type-1',
    maxTenants: 5,
    maxProducts: 100,
    maxOrders: 500,
    hasPrioritySupport: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    type: {
      id: 'type-1',
      name: 'MONTHLY',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  }

  const mockPlanResponse: PlanResponse = {
    id: 'plan-1',
    name: 'Pro',
    slug: 'pro',
    price: 99.9 as unknown as Plan['price'],
    maxTenants: 5,
    maxProducts: 100,
    maxOrders: 500,
    hasPrioritySupport: false,
    isActive: true,
    createdAt: mockPlanWithType.createdAt,
    updatedAt: mockPlanWithType.updatedAt,
    type: { name: 'MONTHLY' },
  }

  const mockRepo: Pick<
    PlanRepository,
    'findAll' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAll: jest.fn().mockResolvedValue([mockPlanWithType]),
    findItem: jest.fn().mockResolvedValue(mockPlanWithType),
    insert: jest.fn().mockResolvedValue(mockPlanWithType),
    updateItem: jest.fn().mockResolvedValue(mockPlanWithType),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanService,
        { provide: PlanRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<PlanService>(PlanService)
  })

  it('getAll() should return mapped PlanResponse[]', async () => {
    const result = await service.getAll()
    expect(mockRepo.findAll).toHaveBeenCalledWith({ include: { type: true } })
    expect(result).toEqual([mockPlanResponse])
    expect((result[0] as Record<string, unknown>).typeId).toBeUndefined()
    expect((result[0] as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('getById() should return mapped PlanResponse', async () => {
    const result = await service.getById('plan-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      include: { type: true },
    })
    expect(result).toEqual(mockPlanResponse)
  })

  it('create() should insert and return mapped PlanResponse', async () => {
    const dto: CreatePlanDto = {
      name: 'Pro',
      slug: 'pro',
      typeId: 'type-1',
      price: 99.9,
      maxTenants: 5,
      maxProducts: 100,
      maxOrders: 500,
    }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: dto,
      include: { type: true },
    })
    expect(result).toEqual(mockPlanResponse)
  })

  it('update() should updateItem and return mapped PlanResponse', async () => {
    const dto: UpdatePlanDto = { name: 'New Pro' }
    const result = await service.update('plan-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      data: dto,
      include: { type: true },
    })
    expect(result).toEqual(mockPlanResponse)
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('plan-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'plan-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
