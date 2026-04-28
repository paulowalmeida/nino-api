import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Role } from '@role/entities/role.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { RoleRepository } from './role.repository'

describe(RoleRepository.name, () => {
  let repository: RoleRepository

  const mockRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
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
        RoleRepository,
        { provide: getRepositoryToken(Role), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<RoleRepository>(RoleRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return an array of roles', async () => {
    mockRepository.find.mockResolvedValue([mockRole])

    const result = await repository.getAll()

    expect(result).toEqual([mockRole])
    expect(mockRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } })
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return role by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockRole)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' })
  })

  it('getById() should call errorService.handle with NotFoundException if not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('getById() should call errorService.handle on db error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockRejectedValue(error)

    await repository.getById('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('create() should create and return a new role', async () => {
    const createData = { name: 'MANAGER', description: 'Manager' }
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue(createData)
    mockRepository.save.mockResolvedValue({ ...mockRole, ...createData })

    const result = await repository.create(createData)

    expect(result).toEqual({ ...mockRole, ...createData })
    expect(mockRepository.create).toHaveBeenCalledWith(createData)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('create() should call errorService.handle with ConflictException if name exists', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockRole)

    await repository.create({ name: 'ADMIN' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('create() should call errorService.handle on db error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(null)
    mockRepository.create.mockReturnValue({})
    mockRepository.save.mockRejectedValue(error)

    await repository.create({ name: 'NEW' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('update() should update and return the role', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockRole, ...updateData }
    mockRepository.findOneBy.mockResolvedValue(mockRole)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update() should call errorService.handle with ConflictException if new name belongs to another role', async () => {
    const another = { ...mockRole, id: 'uuid-2' }
    mockRepository.findOneBy
      .mockResolvedValueOnce(mockRole)
      .mockResolvedValueOnce(another)

    await repository.update('uuid-1', { name: 'OTHER' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(ConflictException))
    expect(mockRepository.save).not.toHaveBeenCalled()
  })

  it('update() should allow update when name is unchanged', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockRole)
    mockRepository.save.mockResolvedValue(mockRole)

    await repository.update('uuid-1', { name: 'ADMIN' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('update() should call errorService.handle on db error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockRole)
    mockRepository.save.mockRejectedValue(error)

    await repository.update('uuid-1', { description: 'Oops' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should delete and return success message', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockRole)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Role deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('delete() should call errorService.handle on db error', async () => {
    const error = new Error('DB error')
    mockRepository.findOneBy.mockResolvedValue(mockRole)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
