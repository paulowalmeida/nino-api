import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { GlobalRole } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { GlobalRoleRepository } from './global-role.repository'

type GlobalRoleModel = {
  findMany: jest.Mock
  findFirst: jest.Mock
  create: jest.Mock
  update: jest.Mock
  count: jest.Mock
  deleteMany: jest.Mock
}

describe(GlobalRoleRepository.name, () => {
  let repository: GlobalRoleRepository

  const mockRole: GlobalRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockGlobalRole: GlobalRoleModel = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
  }

  const mockPrisma = { globalRole: mockGlobalRole }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn().mockImplementation((e: unknown): never => { throw e }),
  }

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

  it('getAll() should return all non-deleted roles', async () => {
    mockGlobalRole.findMany.mockResolvedValue([mockRole])
    expect(await repository.getAll()).toEqual([mockRole])
    expect(mockGlobalRole.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: undefined,
    })
  })

  it('getAll() should throw on db error', async () => {
    mockGlobalRole.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll()).rejects.toThrow('db error')
  })

  it('getById() should return role by id', async () => {
    mockGlobalRole.findFirst.mockResolvedValue(mockRole)
    expect(await repository.getById('uuid-1')).toEqual(mockRole)
    expect(mockGlobalRole.findFirst).toHaveBeenCalledWith({
      where: { id: 'uuid-1', deletedAt: null },
    })
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockGlobalRole.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(NotFoundException)
  })

  it('getByName() should return role by name', async () => {
    mockGlobalRole.findFirst.mockResolvedValue(mockRole)
    expect(await repository.getByName('ADMIN')).toEqual(mockRole)
    expect(mockGlobalRole.findFirst).toHaveBeenCalledWith({
      where: { name: 'ADMIN', deletedAt: null },
    })
  })

  it('getByName() should throw NotFoundException when not found', async () => {
    mockGlobalRole.findFirst.mockResolvedValue(null)
    await expect(repository.getByName('UNKNOWN')).rejects.toThrow(NotFoundException)
  })

  it('create() should create and return new role', async () => {
    const data = { name: 'SUPPORT', description: 'Support' }
    mockGlobalRole.create.mockResolvedValue({ ...mockRole, ...data })
    expect(await repository.create(data)).toEqual({ ...mockRole, ...data })
    expect(mockGlobalRole.create).toHaveBeenCalledWith({ data })
  })

  it('create() should throw on db error', async () => {
    mockGlobalRole.create.mockRejectedValue(new Error('db error'))
    await expect(repository.create({ name: 'X' })).rejects.toThrow('db error')
  })

  it('update() should update and return role', async () => {
    const updated = { ...mockRole, description: 'Updated' }
    mockGlobalRole.update.mockResolvedValue(updated)
    expect(await repository.update('uuid-1', { description: 'Updated' })).toEqual(updated)
    expect(mockGlobalRole.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { description: 'Updated' },
    })
  })

  it('update() should throw on db error', async () => {
    mockGlobalRole.update.mockRejectedValue(new Error('db error'))
    await expect(repository.update('uuid-1', { description: 'x' })).rejects.toThrow('db error')
  })

  it('delete() should soft delete and return success message', async () => {
    mockGlobalRole.update.mockResolvedValue({})
    expect(await repository.delete('uuid-1')).toEqual({ message: 'Deleted successfully' })
    expect(mockGlobalRole.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockGlobalRole.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('uuid-1')).rejects.toThrow('db error')
  })
})
