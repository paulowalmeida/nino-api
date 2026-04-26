import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { TenantStatusRepository } from './tenant-status.repository'

describe(TenantStatusRepository.name, () => {
  let repository: TenantStatusRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockTenantStatus = {
    id: 'uuid-1',
    name: 'ADMIN',
    description: 'Administrator',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    tenantStatus: {
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
        TenantStatusRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<TenantStatusRepository>(TenantStatusRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return tenant statuses array', async () => {
    mockPrismaService.tenantStatus.findMany.mockResolvedValue([
      mockTenantStatus,
    ])

    const result = await repository.getAll()

    expect(result).toEqual([mockTenantStatus])
    expect(prismaService.tenantStatus.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.tenantStatus.findMany.mockRejectedValue(error)

    await repository.getAll()

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getById() should return tenant status by id', async () => {
    mockPrismaService.tenantStatus.findUnique.mockResolvedValue(
      mockTenantStatus,
    )

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockTenantStatus)
    expect(prismaService.tenantStatus.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockPrismaService.tenantStatus.findUnique.mockResolvedValue(null)

    await expect(repository.getById('invalid-id'))
  })

  it('getById() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.tenantStatus.findUnique.mockRejectedValue(error)

    await repository.getById('uuid-1')

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should create new tenant status', async () => {
    const createData = { name: 'ADMIN', description: 'Administrator' }
    mockPrismaService.tenantStatus.findUnique.mockResolvedValue(null)
    mockPrismaService.tenantStatus.create.mockResolvedValue(mockTenantStatus)

    const result = await repository.create(createData)

    expect(result).toEqual(mockTenantStatus)
    expect(prismaService.tenantStatus.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create() should call handleError on error', async () => {
    const error = new Error('DB error')
    const createData = { name: 'ADMIN' }
    mockPrismaService.tenantStatus.create.mockRejectedValue(error)

    await repository.create(createData)

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('update() should update tenant status', async () => {
    const updateData = { description: 'Updated description' }
    const updatedRole = { ...mockTenantStatus, ...updateData }
    mockPrismaService.tenantStatus.update.mockResolvedValue(updatedRole)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updatedRole)
    expect(prismaService.tenantStatus.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('update() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.tenantStatus.update.mockRejectedValue(error)

    await repository.update('uuid-1', { name: 'NEW' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('delete() should remove tenant status', async () => {
    mockPrismaService.tenantStatus.delete.mockResolvedValue({
      message: 'Tenant Status deleted successfully',
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Tenant Status deleted successfully' })
    expect(prismaService.tenantStatus.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('delete() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.tenantStatus.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should throw ConflictException if exists', async () => {
    mockPrismaService.tenantStatus.findUnique.mockResolvedValue(
      mockTenantStatus,
    )

    await repository.create({ name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should throw ConflictException if name exists', async () => {
    const another = { ...mockTenantStatus, id: 'uuid-2' }
    mockPrismaService.tenantStatus.findUnique.mockResolvedValue(another)

    await repository.update('uuid-1', { name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })
})
