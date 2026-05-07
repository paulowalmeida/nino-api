import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { InvoiceStatusRepository } from './invoice-status.repository'
import { InvoiceStatusService } from './invoice-status.service'

describe(InvoiceStatusService.name, () => {
  let service: InvoiceStatusService
  let repository: InvoiceStatusRepository

  const mockInvoiceStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active invoice status',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceStatusService,
        { provide: InvoiceStatusRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<InvoiceStatusService>(InvoiceStatusService)
    repository = module.get<InvoiceStatusRepository>(InvoiceStatusRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return invoice statuses array', async () => {
    mockRepository.getAll.mockResolvedValue([mockInvoiceStatus])

    const result = await service.getAll()

    expect(result).toEqual([mockInvoiceStatus])
    expect(repository.getAll).toHaveBeenCalled()
  })

  it('getById() should return invoice status by id', async () => {
    mockRepository.getById.mockResolvedValue(mockInvoiceStatus)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockInvoiceStatus)
    expect(repository.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockRepository.getById.mockRejectedValue(
      new NotFoundException('InvoiceStatus not found'),
    )

    await expect(service.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create new invoice status', async () => {
    const createData = { name: 'PENDING', description: 'Pending status' }
    mockRepository.create.mockResolvedValue({
      ...mockInvoiceStatus,
      ...createData,
    })

    const result = await service.create(createData)

    expect(result.name).toBe('PENDING')
    expect(repository.create).toHaveBeenCalledWith(createData)
  })

  it('create() should throw ConflictException if name exists', async () => {
    const createData = { name: 'ACTIVE' }
    mockRepository.create.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.create(createData)).rejects.toThrow(ConflictException)
  })

  it('update() should update invoice status', async () => {
    const updateData = { description: 'Updated' }
    mockRepository.update.mockResolvedValue({
      ...mockInvoiceStatus,
      ...updateData,
    })

    const result = await service.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update() should throw NotFoundException if missing', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('InvoiceStatus not found'),
    )

    await expect(service.update('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update() should throw ConflictException if new name exists', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.update('uuid-1', { name: 'PENDING' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('delete() should remove invoice status', async () => {
    mockRepository.delete.mockResolvedValue({
      message: 'Invoice Status deleted successfully',
    })

    const result = await service.delete('uuid-1')

    expect(result).toEqual({
      message: 'Invoice Status deleted successfully',
    })
    expect(repository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should throw NotFoundException if missing', async () => {
    mockRepository.delete.mockRejectedValue(
      new NotFoundException('InvoiceStatus not found'),
    )

    await expect(service.delete('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })
})
