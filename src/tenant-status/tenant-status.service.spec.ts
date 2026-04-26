import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { TenantStatusRepository } from './tenant-status.repository'
import { TenantStatusService } from './tenant-status.service'

describe(TenantStatusService.name, () => {
  let service: TenantStatusService
  let repository: TenantStatusRepository

  const mockTenantStatus = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active tenant',
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
        TenantStatusService,
        { provide: TenantStatusRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<TenantStatusService>(TenantStatusService)
    repository = module.get<TenantStatusRepository>(TenantStatusRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return tenant statuses array', async () => {
    mockRepository.getAll.mockResolvedValue([mockTenantStatus])

    const result = await service.getAll()

    expect(result).toEqual([mockTenantStatus])
    expect(repository.getAll).toHaveBeenCalled()
  })

  it('getById() should return tenant status by id', async () => {
    mockRepository.getById.mockResolvedValue(mockTenantStatus)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockTenantStatus)
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

  it('create() should create new tenant status', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended' }
    mockRepository.create.mockResolvedValue({
      ...mockTenantStatus,
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

  it('update() should update tenant status', async () => {
    const updateData = { description: 'Updated' }
    mockRepository.update.mockResolvedValue({
      ...mockTenantStatus,
      ...updateData,
    })

    const result = await service.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update() should throw NotFoundException if missing', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('Subscription Status not found'),
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

  it('update() should allow update if name belongs to same status', async () => {
    mockRepository.update.mockResolvedValue(mockTenantStatus)

    await service.update('uuid-1', { name: 'ACTIVE' })

    expect(repository.update).toHaveBeenCalled()
  })

  it('delete() should remove tenant status', async () => {
    mockRepository.delete.mockResolvedValue(mockTenantStatus)

    const result = await service.delete('uuid-1')

    expect(result).toEqual(mockTenantStatus)
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
