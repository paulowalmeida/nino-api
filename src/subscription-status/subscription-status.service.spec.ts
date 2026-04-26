import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { SubscriptionStatusRepository } from './subscription-status.repository'
import { SubscriptionStatusService } from './subscription-status.service'

describe(SubscriptionStatusService.name, () => {
  let service: SubscriptionStatusService
  let repository: SubscriptionStatusRepository

  const mockSubscriptionStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active subscription',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionStatusService,
        { provide: SubscriptionStatusRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<SubscriptionStatusService>(SubscriptionStatusService)
    repository = module.get<SubscriptionStatusRepository>(
      SubscriptionStatusRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return subscription statuses array', async () => {
    mockRepository.getAll.mockResolvedValue([mockSubscriptionStatus])

    const result = await service.getAll()

    expect(result).toEqual([mockSubscriptionStatus])
    expect(repository.getAll).toHaveBeenCalled()
  })

  it('getById() should return subscription status by id', async () => {
    mockRepository.getById.mockResolvedValue(mockSubscriptionStatus)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockSubscriptionStatus)
    expect(repository.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockRepository.getById.mockRejectedValue(
      new NotFoundException('Role not found'),
    )

    await expect(service.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create new subscription status', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended' }
    mockRepository.create.mockResolvedValue({
      ...mockSubscriptionStatus,
      ...createData,
    })

    const result = await service.create(createData)

    expect(result.name).toBe('SUSPENDED')
    expect(repository.create).toHaveBeenCalledWith(createData)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockRepository.create.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.create({ name: 'ACTIVE' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('update() should update subscription status', async () => {
    const updateData = { description: 'Updated' }
    mockRepository.update.mockResolvedValue({
      ...mockSubscriptionStatus,
      ...updateData,
    })

    const result = await service.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update() should throw NotFoundException if missing', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('Resource not found'),
    )

    await expect(service.update('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update() should throw ConflictException if new name exists', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(
      service.update('uuid-1', { name: 'SUSPENDED' }),
    ).rejects.toThrow(ConflictException)
  })

  it('delete() should remove subscription status', async () => {
    mockRepository.delete.mockResolvedValue(mockSubscriptionStatus)

    const result = await service.delete('uuid-1')

    expect(result).toEqual(mockSubscriptionStatus)
    expect(repository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should throw NotFoundException if missing', async () => {
    mockRepository.delete.mockRejectedValue(
      new NotFoundException('Resource not found'),
    )

    await expect(service.delete('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })
})
