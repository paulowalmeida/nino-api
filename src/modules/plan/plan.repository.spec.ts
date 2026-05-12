import { NotFoundException } from '@nestjs/common'
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

  const mockPrisma = {
    plan: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation((e: unknown): never => { throw e as never })
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<PlanRepository>(PlanRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return array of PlanResponse', async () => {
    mockPrisma.plan.findMany.mockResolvedValue([mockPlanRaw])
    const result = await repository.getAll()
    expect(result[0].type).toEqual({ name: 'MONTHLY' })
    expect((result[0] as Record<string, unknown>).typeId).toBeUndefined()
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.plan.findMany.mockRejectedValue(new Error('DB error'))
    await expect(repository.getAll()).rejects.toThrow('DB error')
  })

  it('getById() should return PlanResponse', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(mockPlanRaw)
    const result = await repository.getById('plan-uuid-1')
    expect(result.type).toEqual({ name: 'MONTHLY' })
    expect((result as Record<string, unknown>).typeId).toBeUndefined()
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.plan.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid-id')).rejects.toThrow(NotFoundException)
  })

  it('create() should create and return PlanResponse', async () => {
    mockPrisma.plan.create.mockResolvedValue(mockPlanRaw)
    const result = await repository.create({ name: 'Pro', slug: 'pro' } as never)
    expect(result.type).toEqual({ name: 'MONTHLY' })
  })

  it('create() should throw on db error', async () => {
    mockPrisma.plan.create.mockRejectedValue(new Error('db error'))
    await expect(
      repository.create({ name: 'Pro', slug: 'pro' } as never),
    ).rejects.toThrow('db error')
  })

  it('update() should update plan successfully', async () => {
    mockPrisma.plan.update.mockResolvedValue(mockPlanRaw)
    await repository.update('plan-uuid-1', { name: 'New Pro' })
    expect(mockPrisma.plan.update).toHaveBeenCalledWith({
      where: { id: 'plan-uuid-1' },
      data: { name: 'New Pro' },
    })
  })

  it('update() should throw on db error', async () => {
    mockPrisma.plan.update.mockRejectedValue(new Error('db error'))
    await expect(
      repository.update('plan-uuid-1', { name: 'New Pro' }),
    ).rejects.toThrow('db error')
  })

  it('delete() should soft delete plan', async () => {
    mockPrisma.plan.update.mockResolvedValue({})
    await repository.delete('plan-uuid-1')
    expect(mockPrisma.plan.update).toHaveBeenCalledWith({
      where: { id: 'plan-uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.plan.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('plan-uuid-1')).rejects.toThrow('db error')
  })
})
