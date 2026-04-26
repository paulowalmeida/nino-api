import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { InvoiceStatusRepository } from './invoice-status.repository'

describe(InvoiceStatusRepository.name, () => {
  let repository: InvoiceStatusRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockInvoiceStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active invoice',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    invoiceStatus: {
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
        InvoiceStatusRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<InvoiceStatusRepository>(InvoiceStatusRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return invoice statuses array', async () => {
    mockPrismaService.invoiceStatus.findMany.mockResolvedValue([
      mockInvoiceStatus,
    ])

    const result = await repository.getAll()

    expect(result).toEqual([mockInvoiceStatus])
    expect(prismaService.invoiceStatus.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.invoiceStatus.findMany.mockRejectedValue(error)

    await repository.getAll()
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getById() should return status by id', async () => {
    mockPrismaService.invoiceStatus.findUnique.mockResolvedValue(
      mockInvoiceStatus,
    )

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockInvoiceStatus)
    expect(prismaService.invoiceStatus.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockPrismaService.invoiceStatus.findUnique.mockResolvedValue(null)

    await expect(repository.getById('invalid-id'))
  })

  it('getById() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.invoiceStatus.findUnique.mockRejectedValue(error)

    await repository.getById('uuid-1')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should create new invoice status', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended invoice' }

    mockPrismaService.invoiceStatus.findUnique.mockResolvedValue(null)
    mockPrismaService.invoiceStatus.create.mockResolvedValue(mockInvoiceStatus)

    const result = await repository.create(createData)

    expect(result).toEqual(mockInvoiceStatus)
    expect(prismaService.invoiceStatus.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create() should call handleError on error', async () => {
    const error = new Error('DB error')
    const createData = { name: 'ACTIVE' }
    mockPrismaService.invoiceStatus.create.mockRejectedValue(error)

    await repository.create(createData)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockPrismaService.invoiceStatus.findUnique.mockResolvedValue(
      mockInvoiceStatus,
    )

    await repository.create({ name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should update invoice status', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockInvoiceStatus, ...updateData }
    mockPrismaService.invoiceStatus.update.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(prismaService.invoiceStatus.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('update() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.invoiceStatus.update.mockRejectedValue(error)

    await repository.update('uuid-1', { name: 'NEW' })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('update() should throw ConflictException if name exists', async () => {
    const another = { ...mockInvoiceStatus, id: 'uuid-2' }
    mockPrismaService.invoiceStatus.findUnique.mockResolvedValue(another)

    await repository.update('uuid-1', { name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('delete() should remove invoice status', async () => {
    mockPrismaService.invoiceStatus.delete.mockResolvedValue({
      message: 'Invoice Status deleted successfully',
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Invoice Status deleted successfully' })
    expect(prismaService.invoiceStatus.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('delete() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.invoiceStatus.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })
})
