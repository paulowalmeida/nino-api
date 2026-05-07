import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PlanTypeRepository } from './plan-type.repository'

describe(PlanTypeRepository.name, () => {
  let repository: PlanTypeRepository

  const mockRecord = {
    id: 'uuid-1',
    name: 'MONTHLY',
    description: 'Monthly plan',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    planType: {
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
        PlanTypeRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<PlanTypeRepository>(PlanTypeRepository)
  })

  afterEach(() => { jest.clearAllMocks() })

  it('getAll() should return array', async () => {
    mockPrisma.planType.findMany.mockResolvedValue([mockRecord])
    const result = await repository.getAll()
    expect(result).toEqual([mockRecord])
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.planType.findMany.mockRejectedValue(error)
    await repository.getAll()
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockPrisma.planType.findFirst.mockResolvedValue(mockRecord)
    const result = await repository.getById('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('getById() should handle NotFoundException when not found', async () => {
    mockPrisma.planType.findFirst.mockResolvedValue(null)
    await repository.getById('invalid-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return record', async () => {
    mockPrisma.planType.findFirst.mockResolvedValue(null)
    mockPrisma.planType.create.mockResolvedValue(mockRecord)
    const result = await repository.create({
      name: 'ANNUAL',
      description: 'Annual plan',
    })
    expect(result).toEqual(mockRecord)
  })

  it('create() should handle ConflictException when name exists', async () => {
    mockPrisma.planType.findFirst.mockResolvedValue(mockRecord)
    await repository.create({ name: 'MONTHLY' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockPrisma.planType.create).not.toHaveBeenCalled()
  })

  it('update() should update and return record', async () => {
    const updated = { ...mockRecord, description: 'Updated' }
    mockPrisma.planType.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.planType.update.mockResolvedValue(updated)
    const result = await repository.update('uuid-1', {
      description: 'Updated',
    })
    expect(result).toEqual(updated)
  })

  it('delete() should soft delete and return message', async () => {
    mockPrisma.planType.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.planType.update.mockResolvedValue({
      ...mockRecord,
      deletedAt: new Date(),
    })
    const result = await repository.delete('uuid-1')
    expect(result).toEqual({ message: 'Plan Type deleted successfully' })
  })

  it('update() should call errorService.handle with ConflictException when new name exists', async () => {
    mockPrisma.planType.findFirst.mockResolvedValue(mockRecord)
    await repository.update('uuid-1', { name: 'ANNUAL' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.planType.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.planType.update.mockRejectedValue(error)
    await repository.update('uuid-1', { description: 'x' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.planType.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.planType.update.mockRejectedValue(error)
    await repository.delete('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
