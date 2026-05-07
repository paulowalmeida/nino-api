import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { TenantRoleRepository } from './tenant-role.repository'
import { TenantRoleService } from './tenant-role.service'

describe(TenantRoleService.name, () => {
  let service: TenantRoleService
  let repository: TenantRoleRepository

  const mockRole = {
    id: 'uuid-1',
    name: 'MANAGER',
    description: 'Tenant Manager',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
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
        TenantRoleService,
        { provide: TenantRoleRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<TenantRoleService>(TenantRoleService)
    repository = module.get<TenantRoleRepository>(TenantRoleRepository)
  })

  afterEach(() => jest.clearAllMocks())

  it('getAll() should return tenant roles array', async () => {
    mockRepository.getAll.mockResolvedValue([mockRole])

    const result = await service.getAll()

    expect(result).toEqual([mockRole])
    expect(repository.getAll).toHaveBeenCalled()
  })

  it('getById() should return tenant role by id', async () => {
    mockRepository.getById.mockResolvedValue(mockRole)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(repository.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockRepository.getById.mockRejectedValue(
      new NotFoundException('TenantRole not found'),
    )

    await expect(service.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create a new tenant role', async () => {
    const createData = { name: 'CASHIER', description: 'Cashier role' }
    mockRepository.create.mockResolvedValue({ ...mockRole, ...createData })

    const result = await service.create(createData)

    expect(result.name).toBe('CASHIER')
    expect(repository.create).toHaveBeenCalledWith(createData)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockRepository.create.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.create({ name: 'MANAGER' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('update() should update a tenant role', async () => {
    const updateData = { description: 'Updated' }
    mockRepository.update.mockResolvedValue({ ...mockRole, ...updateData })

    const result = await service.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update() should throw NotFoundException if missing', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('TenantRole not found'),
    )

    await expect(service.update('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update() should throw ConflictException if new name exists', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.update('uuid-1', { name: 'CASHIER' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('delete() should remove a tenant role', async () => {
    mockRepository.delete.mockResolvedValue({
      message: 'TenantRole deleted successfully',
    })

    const result = await service.delete('uuid-1')

    expect(result).toEqual({ message: 'TenantRole deleted successfully' })
    expect(repository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should throw NotFoundException if missing', async () => {
    mockRepository.delete.mockRejectedValue(
      new NotFoundException('TenantRole not found'),
    )

    await expect(service.delete('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('getByName() should return tenant role by name', async () => {
    mockRepository.getByName.mockResolvedValue(mockRole)

    const result = await service.getByName('MANAGER')

    expect(result).toEqual(mockRole)
    expect(repository.getByName).toHaveBeenCalledWith('MANAGER')
  })
})
