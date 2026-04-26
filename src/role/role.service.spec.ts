import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { RoleRepository } from './role.repository'
import { RoleService } from './role.service'

describe(RoleService.name, () => {
  let service: RoleService
  let repository: RoleRepository

  const mockRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
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
        RoleService,
        { provide: RoleRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<RoleService>(RoleService)
    repository = module.get<RoleRepository>(RoleRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return roles array', async () => {
    mockRepository.getAll.mockResolvedValue([mockRole])

    const result = await service.getAll()

    expect(result).toEqual([mockRole])
    expect(repository.getAll).toHaveBeenCalled()
  })

  it('getById() should return role by id', async () => {
    mockRepository.getById.mockResolvedValue(mockRole)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockRole)
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

  it('create() should create a new role', async () => {
    const createData = { name: 'MANAGER', description: 'Manager role' }
    mockRepository.create.mockResolvedValue({ ...mockRole, ...createData })

    const result = await service.create(createData)

    expect(result.name).toBe('MANAGER')
    expect(repository.create).toHaveBeenCalledWith(createData)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockRepository.create.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.create({ name: 'ADMIN' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('update() should update a role', async () => {
    const updateData = { description: 'Updated' }
    mockRepository.update.mockResolvedValue({ ...mockRole, ...updateData })

    const result = await service.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update() should throw NotFoundException if missing', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('Role not found'),
    )

    await expect(service.update('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update() should throw ConflictException if new name exists', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.update('uuid-1', { name: 'USER' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('update() should allow update if name belongs to same role', async () => {
    mockRepository.update.mockResolvedValue(mockRole)

    await service.update('uuid-1', { name: 'ADMIN' })

    expect(repository.update).toHaveBeenCalled()
  })

  it('delete() should remove a role', async () => {
    mockRepository.delete.mockResolvedValue(mockRole)

    const result = await service.delete('uuid-1')

    expect(result).toEqual(mockRole)
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
