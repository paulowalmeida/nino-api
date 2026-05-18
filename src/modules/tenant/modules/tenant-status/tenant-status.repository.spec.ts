import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { TenantStatusRepository } from './tenant-status.repository'

describe(TenantStatusRepository.name, () => {
  let repository: TenantStatusRepository

  const mockRecord = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    tenantStatus: {
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
        TenantStatusRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<TenantStatusRepository>(TenantStatusRepository)
  })

  afterEach(() => { jest.clearAllMocks() })

  it('getAll() should return array', async () => {
    mockPrisma.tenantStatus.findMany.mockResolvedValue([mockRecord])
    const result = await repository.getAll()
    expect(result).toEqual([mockRecord])
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.tenantStatus.findMany.mockRejectedValue(error)
    await repository.getAll()
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockPrisma.tenantStatus.findFirst.mockResolvedValue(mockRecord)
    const result = await repository.getById('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('getById() should handle NotFoundException when not found', async () => {
    mockPrisma.tenantStatus.findFirst.mockResolvedValue(null)
    await repository.getById('invalid-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return record', async () => {
    mockPrisma.tenantStatus.create.mockResolvedValue(mockRecord)
    const result = await repository.create({
      name: 'SUSPENDED',
      description: 'x',
    })
    expect(result).toEqual(mockRecord)
  })

  it('update() should update and return record', async () => {
    const updated = { ...mockRecord, description: 'Updated' }
    mockPrisma.tenantStatus.update.mockResolvedValue(updated)
    const result = await repository.update('uuid-1', { description: 'Updated' })
    expect(result).toEqual(updated)
  })

  it('delete() should soft delete and return message', async () => {
    mockPrisma.tenantStatus.update.mockResolvedValue({
      ...mockRecord,
      deletedAt: new Date(),
    })
    const result = await repository.delete('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.tenantStatus.update.mockRejectedValue(error)
    await repository.update('uuid-1', { description: 'x' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.tenantStatus.update.mockRejectedValue(error)
    await repository.delete('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
