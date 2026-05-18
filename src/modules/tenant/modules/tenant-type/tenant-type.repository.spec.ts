import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { TenantType } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { TenantTypeRepository } from './tenant-type.repository'

describe(TenantTypeRepository.name, () => {
  let repository: TenantTypeRepository

  const mockRecord: TenantType = {
    id: 'uuid-1',
    name: 'RESIDENTIAL',
    description: 'Residential tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    tenantType: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => {
      throw e
    }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation((e: unknown): never => {
      throw e as never
    })
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantTypeRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<TenantTypeRepository>(TenantTypeRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return all non-deleted records ordered by name', async () => {
    mockPrisma.tenantType.findMany.mockResolvedValue([mockRecord])
    const result = await repository.getAll()
    expect(result).toEqual([mockRecord])
    expect(mockPrisma.tenantType.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: undefined,
    })
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.tenantType.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll()).rejects.toThrow('db error')
  })

  it('getById() should return record by id', async () => {
    mockPrisma.tenantType.findFirst.mockResolvedValue(mockRecord)
    const result = await repository.getById('uuid-1')
    expect(result).toEqual(mockRecord)
    expect(mockPrisma.tenantType.findFirst).toHaveBeenCalledWith({
      where: { id: 'uuid-1', deletedAt: null },
      include: undefined,
    })
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.tenantType.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(NotFoundException)
  })

  it('create() should create and return record', async () => {
    const data = { name: 'COMMERCIAL', description: 'Commercial tenant' }
    mockPrisma.tenantType.create.mockResolvedValue({ ...mockRecord, ...data })
    const result = await repository.create(data)
    expect(result).toEqual({ ...mockRecord, ...data })
    expect(mockPrisma.tenantType.create).toHaveBeenCalledWith({ data })
  })

  it('create() should throw on db error', async () => {
    mockPrisma.tenantType.create.mockRejectedValue(new Error('db error'))
    await expect(repository.create({ name: 'X' })).rejects.toThrow('db error')
  })

  it('update() should update and return record', async () => {
    const updated = { ...mockRecord, description: 'Updated' }
    mockPrisma.tenantType.update.mockResolvedValue(updated)
    const result = await repository.update('uuid-1', { description: 'Updated' })
    expect(result).toEqual(updated)
    expect(mockPrisma.tenantType.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { description: 'Updated' },
      include: undefined,
    })
  })

  it('update() should throw on db error', async () => {
    mockPrisma.tenantType.update.mockRejectedValue(new Error('db error'))
    await expect(
      repository.update('uuid-1', { description: 'x' }),
    ).rejects.toThrow('db error')
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.tenantType.update.mockResolvedValue({
      ...mockRecord,
      deletedAt: new Date(),
    })
    const result = await repository.delete('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.tenantType.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.tenantType.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('uuid-1')).rejects.toThrow('db error')
  })
})
