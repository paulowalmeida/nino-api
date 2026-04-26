import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { SubscriptionStatusRepository } from './subscription-status.repository'

describe(SubscriptionStatusRepository.name, () => {
  let repository: SubscriptionStatusRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockSubscriptionStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active subscription',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    subscriptionStatus: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockPrismaErrorService = {
    handleError: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionStatusRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<SubscriptionStatusRepository>(
      SubscriptionStatusRepository,
    )
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return subscription statuses array', async () => {
    mockPrismaService.subscriptionStatus.findMany.mockResolvedValue([
      mockSubscriptionStatus,
    ])

    const result = await repository.getAll()

    expect(result).toEqual([mockSubscriptionStatus])
    expect(prismaService.subscriptionStatus.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.subscriptionStatus.findMany.mockRejectedValue(error)

    await expect(repository.getAll())
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getById() should return status by id', async () => {
    mockPrismaService.subscriptionStatus.findUnique.mockResolvedValue(
      mockSubscriptionStatus,
    )

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockSubscriptionStatus)
    expect(prismaService.subscriptionStatus.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockPrismaService.subscriptionStatus.findUnique.mockResolvedValue(null)

    await expect(repository.getById('invalid-id'))
  })

  it('getById() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.subscriptionStatus.findUnique.mockRejectedValue(error)

    await expect(repository.getById('uuid-1'))
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should create new subscription status', async () => {
    const createData = {
      name: 'SUSPENDED',
      description: 'Suspended subscription',
    }
    mockPrismaService.subscriptionStatus.findUnique.mockResolvedValue(null)
    mockPrismaService.subscriptionStatus.create.mockResolvedValue(
      mockSubscriptionStatus,
    )

    const result = await repository.create(createData)

    expect(result).toEqual(mockSubscriptionStatus)
    expect(prismaService.subscriptionStatus.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create() should call handleError on error', async () => {
    const error = new Error('DB error')
    const createData = { name: 'ACTIVE' }
    mockPrismaService.subscriptionStatus.create.mockRejectedValue(error)

    await repository.create(createData)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('update() should update subscription status', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockSubscriptionStatus, ...updateData }
    mockPrismaService.subscriptionStatus.update.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(prismaService.subscriptionStatus.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('update() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.subscriptionStatus.update.mockRejectedValue(error)

    await repository.update('uuid-1', { name: 'NEW' })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('delete() should remove subscription status', async () => {
    mockPrismaService.subscriptionStatus.delete.mockResolvedValue({
      message: 'Subscription Status deleted successfully',
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({
      message: 'Subscription Status deleted successfully',
    })
    expect(prismaService.subscriptionStatus.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('delete() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.subscriptionStatus.delete.mockRejectedValue(error)

    await expect(repository.delete('uuid-1'))
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should throw ConflictException if exists', async () => {
    mockPrismaService.subscriptionStatus.findUnique.mockResolvedValue(
      mockSubscriptionStatus,
    )

    await repository.create({ name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should throw ConflictException if exists', async () => {
    const another = { ...mockSubscriptionStatus, id: 'uuid-2' }
    mockPrismaService.subscriptionStatus.findUnique.mockResolvedValue(another)

    await repository.update('uuid-1', { name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })
})
