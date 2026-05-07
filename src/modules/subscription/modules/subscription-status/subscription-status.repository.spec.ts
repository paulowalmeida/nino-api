import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { SubscriptionStatusRepository } from './subscription-status.repository'

describe(SubscriptionStatusRepository.name, () => {
  let repository: SubscriptionStatusRepository

  const mockRecord = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active subscription',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    subscriptionStatus: {
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
        SubscriptionStatusRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<SubscriptionStatusRepository>(
      SubscriptionStatusRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array', async () => {
    mockPrisma.subscriptionStatus.findMany.mockResolvedValue([mockRecord])
    const result = await repository.getAll()
    expect(result).toEqual([mockRecord])
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.subscriptionStatus.findMany.mockRejectedValue(error)
    await repository.getAll()
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(mockRecord)
    const result = await repository.getById('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('getById() should handle NotFoundException when not found', async () => {
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(null)
    await repository.getById('invalid-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return record', async () => {
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(null)
    mockPrisma.subscriptionStatus.create.mockResolvedValue(mockRecord)
    const result = await repository.create({
      name: 'SUSPENDED',
      description: 'x',
    })
    expect(result).toEqual(mockRecord)
  })

  it('create() should handle ConflictException when name exists', async () => {
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(mockRecord)
    await repository.create({ name: 'ACTIVE' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockPrisma.subscriptionStatus.create).not.toHaveBeenCalled()
  })

  it('update() should update and return record', async () => {
    const updated = { ...mockRecord, description: 'Updated' }
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.subscriptionStatus.update.mockResolvedValue(updated)
    const result = await repository.update('uuid-1', {
      description: 'Updated',
    })
    expect(result).toEqual(updated)
  })

  it('delete() should soft delete and return message', async () => {
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.subscriptionStatus.update.mockResolvedValue({
      ...mockRecord,
      deletedAt: new Date(),
    })
    const result = await repository.delete('uuid-1')
    expect(result).toEqual({
      message: 'Subscription Status deleted successfully',
    })
  })

  it('update() should call errorService.handle with ConflictException when new name exists', async () => {
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(mockRecord)
    await repository.update('uuid-1', { name: 'SUSPENDED' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.subscriptionStatus.update.mockRejectedValue(error)
    await repository.update('uuid-1', { description: 'x' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.subscriptionStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.subscriptionStatus.update.mockRejectedValue(error)
    await repository.delete('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
