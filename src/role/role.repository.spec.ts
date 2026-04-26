import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { RoleRepository } from './role.repository'

describe(RoleRepository.name, () => {
  let repository: RoleRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockRole = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockPrismaErrorService = {
    handleError: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<RoleRepository>(RoleRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return an array of roles', async () => {
    mockPrismaService.role.findMany.mockResolvedValue([mockRole])

    const result = await repository.getAll()

    expect(result).toEqual([mockRole])
    expect(prismaService.role.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.role.findMany.mockRejectedValue(error)

    await repository.getAll()

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getById() should return role by id', async () => {
    mockPrismaService.role.findUnique.mockResolvedValue(mockRole)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(prismaService.role.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('getById() should throw NotFoundException if role missing', async () => {
    mockPrismaService.role.findUnique.mockResolvedValue(null)

    await expect(repository.getById('invalid-id'))
  })

  it('getById() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.role.findUnique.mockRejectedValue(error)

    await repository.getById('uuid-1')

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should create a new role', async () => {
    const createData = { name: 'ADMIN', description: 'Administrator' }
    mockPrismaService.role.findUnique.mockResolvedValue(null)
    mockPrismaService.role.create.mockResolvedValue(mockRole)

    const result = await repository.create(createData)

    expect(result).toEqual(mockRole)
    expect(prismaService.role.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create() should call handleError on error', async () => {
    const error = new Error('DB error')
    const createData = { name: 'ADMIN' }
    mockPrismaService.role.create.mockRejectedValue(error)

    await repository.create(createData)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('update() should update a role', async () => {
    const updateData = { description: 'Updated description' }
    const updatedRole = { ...mockRole, ...updateData }
    mockPrismaService.role.update.mockResolvedValue(updatedRole)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updatedRole)
    expect(prismaService.role.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('update() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.role.update.mockRejectedValue(error)

    await repository.update('uuid-1', { name: 'NEW' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('delete() should remove a role', async () => {
    mockPrismaService.role.delete.mockResolvedValue({
      message: 'Role deleted successfully',
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Role deleted successfully' })
    expect(prismaService.role.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('delete() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.role.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockPrismaService.role.findUnique.mockResolvedValue(mockRole)

    await repository.create({ name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should throw ConflictException if name belongs to another role', async () => {
    const another = { ...mockRole, id: 'uuid-2' }
    mockPrismaService.role.findUnique.mockResolvedValue(another)

    await repository.update('uuid-1', { name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })
})
