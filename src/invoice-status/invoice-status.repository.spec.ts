import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { InvoiceStatus } from '@invoice-status/entities/invoice-status.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { InvoiceStatusRepository } from './invoice-status.repository'

describe(InvoiceStatusRepository.name, () => {
  let repository: InvoiceStatusRepository

  const mockInvoiceStatus = {
    id: 'uuid-1',
    name: 'PENDING',
    description: 'Pending invoice',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceStatusRepository,
        { provide: getRepositoryToken(InvoiceStatus), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<InvoiceStatusRepository>(InvoiceStatusRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array', async () => {
    mockRepository.find.mockResolvedValue([mockInvoiceStatus])

    const result = await repository.getAll()

    expect(result).toEqual([mockInvoiceStatus])
    expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } })
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockInvoiceStatus)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockInvoiceStatus)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' })
  })

  it('getById() should call errorService.handle with NotFoundException if not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('create() should create and return record', async () => {
    const createData = { name: 'PAID', description: 'Paid invoice' }
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue(createData)
    mockRepository.save.mockResolvedValue(mockInvoiceStatus)

    const result = await repository.create(createData)

    expect(result).toEqual(mockInvoiceStatus)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('create() should call errorService.handle with ConflictException if name exists', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockInvoiceStatus)

    await repository.create({ name: 'PENDING' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('update() should update and return record', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockInvoiceStatus, ...updateData }
    mockRepository.findOneBy.mockResolvedValue(mockInvoiceStatus)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update() should call errorService.handle with ConflictException if new name belongs to another', async () => {
    const another = { ...mockInvoiceStatus, id: 'uuid-2' }
    mockRepository.findOneBy
      .mockResolvedValueOnce(mockInvoiceStatus)
      .mockResolvedValueOnce(another)

    await repository.update('uuid-1', { name: 'PAID' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('delete() should delete and return message', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockInvoiceStatus)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Invoice Status deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockInvoiceStatus)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
