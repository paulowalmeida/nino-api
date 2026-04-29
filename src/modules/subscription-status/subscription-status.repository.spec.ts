import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { SubscriptionStatus } from '@subscription-status/entities/subscription-status.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { SubscriptionStatusRepository } from './subscription-status.repository'

describe(SubscriptionStatusRepository.name, () => {
  let repository: SubscriptionStatusRepository

  const mockSubscriptionStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active subscription',
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
        SubscriptionStatusRepository,
        { provide: getRepositoryToken(SubscriptionStatus), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<SubscriptionStatusRepository>(SubscriptionStatusRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array', async () => {
    mockRepository.find.mockResolvedValue([mockSubscriptionStatus])

    const result = await repository.getAll()

    expect(result).toEqual([mockSubscriptionStatus])
    expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } })
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSubscriptionStatus)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockSubscriptionStatus)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' })
  })

  it('getById() should call errorService.handle with NotFoundException if not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('create() should create and return record', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended subscription' }
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue(createData)
    mockRepository.save.mockResolvedValue(mockSubscriptionStatus)

    const result = await repository.create(createData)

    expect(result).toEqual(mockSubscriptionStatus)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('create() should call errorService.handle with ConflictException if name exists', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSubscriptionStatus)

    await repository.create({ name: 'ACTIVE' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('update() should update and return record', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockSubscriptionStatus, ...updateData }
    mockRepository.findOneBy.mockResolvedValue(mockSubscriptionStatus)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update() should call errorService.handle with ConflictException if new name belongs to another', async () => {
    const another = { ...mockSubscriptionStatus, id: 'uuid-2' }
    mockRepository.findOneBy
      .mockResolvedValueOnce(mockSubscriptionStatus)
      .mockResolvedValueOnce(another)

    await repository.update('uuid-1', { name: 'SUSPENDED' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('delete() should delete and return message', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSubscriptionStatus)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Subscription Status deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockSubscriptionStatus)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
