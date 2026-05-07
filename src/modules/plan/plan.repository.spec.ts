import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PlanRepository } from './plan.repository'

describe(PlanRepository.name, () => {
  let repository: PlanRepository

  const mockPlanRaw = {
    id: 'plan-uuid-1',
    name: 'Pro',
    slug: 'pro',
    price: 197,
    typeId: 'type-1',
    maxTenants: 5,
    maxProducts: 100,
    maxOrders: 500,
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

  const mockPlanResponse = {
    id: 'plan-uuid-1',
    name: 'Pro',
    slug: 'pro',
    price: 197,
    maxTenants: 5,
    maxProducts: 100,
    maxOrders: 500,
    isActive: true,
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
    type: { name: 'MONTHLY' },
  }

  const mockPrisma = {
    plan: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<PlanRepository>(PlanRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array of PlanResponse', async () => {
    mockPrisma.plan.findMany.mockResolvedValue([mockPlanRaw])
    const result = await repository.getAll()
    expect(result[0].type).toEqual({ name: 'MONTHLY' })
    expect((result[0] as any).typeId).toBeUndefined()
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.plan.findMany.mockRejectedValue(error)
    await repository.getAll()
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return PlanResponse', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    const result = await repository.getById('plan-uuid-1')
    expect(result.type).toEqual({ name: 'MONTHLY' })
    expect((result as any).typeId).toBeUndefined()
  })

  it('getById() should call errorService.handle with NotFoundException if not found', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(null)
    await repository.getById('invalid-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return PlanResponse', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(null)
    mockPrisma.plan.create.mockResolvedValue(mockPlanRaw)
    const result = await repository.create({ name: 'Pro', slug: 'pro' } as any)
    expect(result.type).toEqual({ name: 'MONTHLY' })
  })

  it('create() should call errorService.handle with ConflictException if slug exists', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    await repository.create({ name: 'Pro', slug: 'pro' } as any)
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockPrisma.plan.create).not.toHaveBeenCalled()
  })

  it('update() should update plan successfully', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    mockPrisma.plan.update.mockResolvedValue(mockPlanRaw)
    await repository.update('plan-uuid-1', { name: 'New Pro' })
    expect(mockPrisma.plan.update).toHaveBeenCalledWith({
      where: { id: 'plan-uuid-1' },
      data: { name: 'New Pro' },
    })
  })

  it('delete() should soft delete plan', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    mockPrisma.plan.update.mockResolvedValue({
      ...mockPlanRaw,
      deletedAt: new Date(),
    })
    await repository.delete('plan-uuid-1')
    expect(mockPrisma.plan.update).toHaveBeenCalledWith({
      where: { id: 'plan-uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('update() should call errorService.handle with ConflictException when new slug exists', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    await repository.update('plan-uuid-1', { slug: 'enterprise' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    mockPrisma.plan.update.mockRejectedValue(error)
    await repository.update('plan-uuid-1', { name: 'New Pro' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    mockPrisma.plan.update.mockRejectedValue(error)
    await repository.delete('plan-uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
