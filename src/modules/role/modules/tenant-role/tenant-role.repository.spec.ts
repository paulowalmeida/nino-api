import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { TenantRoleRepository } from './tenant-role.repository'

describe(TenantRoleRepository.name, () => {
  let repository: TenantRoleRepository

  const mockRole = {
    id: 'uuid-1',
    name: 'MANAGER',
    description: 'Tenant Manager',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    tenantRole: {
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
        TenantRoleRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<TenantRoleRepository>(TenantRoleRepository)
  })

  afterEach(() => jest.clearAllMocks())

  it('getAll() should return an array of tenant roles', async () => {
    mockPrisma.tenantRole.findMany.mockResolvedValue([mockRole])

    const result = await repository.getAll()

    expect(result).toEqual([mockRole])
    expect(mockPrisma.tenantRole.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.tenantRole.findMany.mockRejectedValue(error)

    await repository.getAll()

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return tenant role by id', async () => {
    mockPrisma.tenantRole.findFirst.mockResolvedValue(mockRole)

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockRole)
    expect(mockPrisma.tenantRole.findFirst).toHaveBeenCalledWith({
      where: { id: 'uuid-1', deletedAt: null },
    })
  })

  it('getById() should call errorService.handle on NotFoundException', async () => {
    mockPrisma.tenantRole.findFirst.mockResolvedValue(null)

    await repository.getById('invalid-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return a new tenant role', async () => {
    const createData = { name: 'CASHIER', description: 'Cashier' }
    mockPrisma.tenantRole.create.mockResolvedValue({ ...mockRole, ...createData })

    const result = await repository.create(createData)

    expect(result).toEqual({ ...mockRole, ...createData })
    expect(mockPrisma.tenantRole.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('update() should update and return the tenant role', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockRole, ...updateData }
    mockPrisma.tenantRole.update.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(mockPrisma.tenantRole.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.tenantRole.update.mockResolvedValue({
      ...mockRole,
      deletedAt: new Date(),
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.tenantRole.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('getByName() should return tenant role by name', async () => {
    mockPrisma.tenantRole.findFirst.mockResolvedValue(mockRole)

    const result = await repository.getByName('MANAGER')

    expect(result).toEqual(mockRole)
  })

  it('getByName() should call errorService.handle with NotFoundException if not found', async () => {
    mockPrisma.tenantRole.findFirst.mockResolvedValue(null)

    await repository.getByName('UNKNOWN')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.tenantRole.update.mockRejectedValue(error)

    await repository.update('uuid-1', { description: 'x' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.tenantRole.update.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
