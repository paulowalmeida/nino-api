import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { GlobalRoleRepository } from './global-role.repository'
import { GlobalRoleService } from './global-role.service'

describe(GlobalRoleService.name, () => {
  let service: GlobalRoleService
  let repository: GlobalRoleRepository

  const mockRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
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
        GlobalRoleService,
        { provide: GlobalRoleRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<GlobalRoleService>(GlobalRoleService)
    repository = module.get<GlobalRoleRepository>(GlobalRoleRepository)
  })

  afterEach(() => jest.clearAllMocks())

  it('getAll() should return global roles array', async () => {
    mockRepository.getAll.mockResolvedValue([mockRole])

    const result = await service.getAll()

    expect(result).toEqual([mockRole])
    expect(repository.getAll).toHaveBeenCalled()
  })

  it('getById() should return global role by id', async () => {
    mockRepository.getById.mockResolvedValue(mockRole)

    const result = await service.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(repository.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockRepository.getById.mockRejectedValue(
      new NotFoundException('GlobalRole not found'),
    )

    await expect(service.getById('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create a new global role', async () => {
    const createData = { name: 'SUPPORT', description: 'Support role' }
    mockRepository.create.mockResolvedValue({ ...mockRole, ...createData })

    const result = await service.create(createData)

    expect(result.name).toBe('SUPPORT')
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

  it('update() should update a global role', async () => {
    const updateData = { description: 'Updated' }
    mockRepository.update.mockResolvedValue({ ...mockRole, ...updateData })

    const result = await service.update('uuid-1', updateData)

    expect(result.description).toBe('Updated')
    expect(repository.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('update() should throw NotFoundException if missing', async () => {
    mockRepository.update.mockRejectedValue(
      new NotFoundException('GlobalRole not found'),
    )

    await expect(service.update('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    )
  })

  it('update() should throw ConflictException if new name exists', async () => {
    mockRepository.update.mockRejectedValue(
      new ConflictException('Name already exists'),
    )

    await expect(service.update('uuid-1', { name: 'SUPPORT' })).rejects.toThrow(
      ConflictException,
    )
  })

  it('delete() should remove a global role', async () => {
    mockRepository.delete.mockResolvedValue({
      message: 'GlobalRole deleted successfully',
    })

    const result = await service.delete('uuid-1')

    expect(result).toEqual({ message: 'GlobalRole deleted successfully' })
    expect(repository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should throw NotFoundException if missing', async () => {
    mockRepository.delete.mockRejectedValue(
      new NotFoundException('GlobalRole not found'),
    )

    await expect(service.delete('invalid-id')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('getByName() should return global role by name', async () => {
    mockRepository.getByName.mockResolvedValue(mockRole)

    const result = await service.getByName('ADMIN')

    expect(result).toEqual(mockRole)
    expect(repository.getByName).toHaveBeenCalledWith('ADMIN')
  })
})
