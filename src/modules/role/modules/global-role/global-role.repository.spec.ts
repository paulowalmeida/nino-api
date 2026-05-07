import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { GlobalRoleRepository } from './global-role.repository'

describe(GlobalRoleRepository.name, () => {
  let repository: GlobalRoleRepository

  const mockRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    globalRole: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalRoleRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<GlobalRoleRepository>(GlobalRoleRepository)
  })

  afterEach(() => jest.clearAllMocks())

  it('getAll() should return an array of global roles', async () => {
    mockPrisma.globalRole.findMany.mockResolvedValue([mockRole])

    const result = await repository.getAll()

    expect(result).toEqual([mockRole])
    expect(mockPrisma.globalRole.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.globalRole.findMany.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return global role by id', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(mockPrisma.globalRole.findFirst).toHaveBeenCalledWith({
      where: { id: 'uuid-1', deletedAt: null },
    })
  })

  it('getById() should call errorService.handle on NotFoundException', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return a new global role', async () => {
    const createData = { name: 'SUPPORT', description: 'Support' }
    mockPrisma.globalRole.findFirst.mockResolvedValue(null)
    mockPrisma.globalRole.create.mockResolvedValue({
      ...mockRole,
      ...createData,
    })

    const result = await repository.create(createData)

    expect(result).toEqual({ ...mockRole, ...createData })
    expect(mockPrisma.globalRole.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create() should call errorService.handle on ConflictException', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)

    await repository.create({ name: 'ADMIN', description: 'x' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockPrisma.globalRole.create).not.toHaveBeenCalled()
  })

  it('update() should update and return the global role', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockRole, ...updateData }
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)
    mockPrisma.globalRole.update.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockPrisma.globalRole.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)
    mockPrisma.globalRole.update.mockResolvedValue({
      ...mockRole,
      deletedAt: new Date(),
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'GlobalRole deleted successfully' })
    expect(mockPrisma.globalRole.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should call errorService.handle on NotFoundException', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(null)

    await repository.delete('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('getByName() should return global role by name', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)

    const result = await repository.getByName('ADMIN')

    expect(result).toEqual(mockRole)
  })

  it('getByName() should call errorService.handle with NotFoundException if not found', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(null)

    await repository.getByName('UNKNOWN')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('update() should call errorService.handle with ConflictException when new name exists', async () => {
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)

    await repository.update('uuid-1', { name: 'SUPPORT' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)
    mockPrisma.globalRole.update.mockRejectedValue(error)

    await repository.update('uuid-1', { description: 'x' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.globalRole.findFirst.mockResolvedValue(mockRole)
    mockPrisma.globalRole.update.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
