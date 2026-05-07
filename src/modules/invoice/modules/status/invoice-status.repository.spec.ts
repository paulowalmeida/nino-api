import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { InvoiceStatusRepository } from './invoice-status.repository'

describe(InvoiceStatusRepository.name, () => {
  let repository: InvoiceStatusRepository

  const mockRecord = {
    id: 'uuid-1',
    name: 'PENDING',
    description: 'Pending invoice',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    invoiceStatus: {
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
        InvoiceStatusRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<InvoiceStatusRepository>(InvoiceStatusRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array', async () => {
    mockPrisma.invoiceStatus.findMany.mockResolvedValue([mockRecord])
    const result = await repository.getAll()
    expect(result).toEqual([mockRecord])
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.invoiceStatus.findMany.mockRejectedValue(error)
    await repository.getAll()
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(mockRecord)
    const result = await repository.getById('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('getById() should handle NotFoundException when not found', async () => {
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(null)
    await repository.getById('invalid-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return record', async () => {
    const createData = { name: 'PAID', description: 'Paid invoice' }
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(null)
    mockPrisma.invoiceStatus.create.mockResolvedValue(mockRecord)
    const result = await repository.create(createData)
    expect(result).toEqual(mockRecord)
  })

  it('create() should handle ConflictException when name exists', async () => {
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(mockRecord)
    await repository.create({ name: 'PENDING' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockPrisma.invoiceStatus.create).not.toHaveBeenCalled()
  })

  it('update() should update and return record', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockRecord, ...updateData }
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.invoiceStatus.update.mockResolvedValue(updated)
    const result = await repository.update('uuid-1', updateData)
    expect(result).toEqual(updated)
  })

  it('delete() should soft delete and return message', async () => {
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.invoiceStatus.update.mockResolvedValue({
      ...mockRecord,
      deletedAt: new Date(),
    })
    const result = await repository.delete('uuid-1')
    expect(result).toEqual({ message: 'Invoice Status deleted successfully' })
  })

  it('update() should call errorService.handle with ConflictException when new name exists', async () => {
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(mockRecord)
    await repository.update('uuid-1', { name: 'PAID' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.invoiceStatus.update.mockRejectedValue(error)
    await repository.update('uuid-1', { description: 'x' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.invoiceStatus.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.invoiceStatus.update.mockRejectedValue(error)
    await repository.delete('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
