import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PlanType } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PlanTypeRepository } from './plan-type.repository'

type PlanTypeModel = {
  findMany: jest.Mock
  findFirst: jest.Mock
  create: jest.Mock
  update: jest.Mock
}

describe(PlanTypeRepository.name, () => {
  let repository: PlanTypeRepository

  const mockRecord: PlanType = {
    id: 'uuid-1',
    name: 'MONTHLY',
    description: 'Monthly plan',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPlanType: PlanTypeModel = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }

  const mockPrisma = { planType: mockPlanType }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn().mockImplementation((e: unknown): never => { throw e }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanTypeRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<PlanTypeRepository>(PlanTypeRepository)
  })

  afterEach(() => jest.clearAllMocks())

  it('getAll() should return all non-deleted records', async () => {
    mockPlanType.findMany.mockResolvedValue([mockRecord])
    expect(await repository.getAll()).toEqual([mockRecord])
    expect(mockPlanType.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: undefined,
    })
  })

  it('getAll() should throw on db error', async () => {
    mockPlanType.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll()).rejects.toThrow('db error')
  })

  it('getById() should return record by id', async () => {
    mockPlanType.findFirst.mockResolvedValue(mockRecord)
    expect(await repository.getById('uuid-1')).toEqual(mockRecord)
    expect(mockPlanType.findFirst).toHaveBeenCalledWith({
      where: { id: 'uuid-1', deletedAt: null },
    })
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPlanType.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(NotFoundException)
  })

  it('create() should create and return new record', async () => {
    const data = { name: 'ANNUAL', description: 'Annual plan' }
    mockPlanType.findFirst.mockResolvedValue(null)
    mockPlanType.create.mockResolvedValue({ ...mockRecord, ...data })
    expect(await repository.create(data)).toEqual({ ...mockRecord, ...data })
    expect(mockPlanType.create).toHaveBeenCalledWith({ data })
  })

  it('create() should throw ConflictException when name already exists', async () => {
    mockPlanType.findFirst.mockResolvedValue(mockRecord)
    await expect(repository.create({ name: 'MONTHLY' })).rejects.toThrow(ConflictException)
    expect(mockPlanType.create).not.toHaveBeenCalled()
  })

  it('create() should throw on db error', async () => {
    mockPlanType.findFirst.mockResolvedValue(null)
    mockPlanType.create.mockRejectedValue(new Error('db error'))
    await expect(repository.create({ name: 'X' })).rejects.toThrow('db error')
  })

  it('update() should update and return record', async () => {
    const updated = { ...mockRecord, description: 'Updated' }
    mockPlanType.findFirst.mockResolvedValue(mockRecord)
    mockPlanType.update.mockResolvedValue(updated)
    expect(await repository.update('uuid-1', { description: 'Updated' })).toEqual(updated)
    expect(mockPlanType.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { description: 'Updated' },
    })
  })

  it('update() should throw NotFoundException when record not found', async () => {
    mockPlanType.findFirst.mockResolvedValue(null)
    await expect(repository.update('invalid', { description: 'x' })).rejects.toThrow(NotFoundException)
  })

  it('update() should throw ConflictException when new name already exists', async () => {
    const other = { ...mockRecord, id: 'uuid-2', name: 'ANNUAL' }
    mockPlanType.findFirst
      .mockResolvedValueOnce(mockRecord)
      .mockResolvedValueOnce(other)
    await expect(repository.update('uuid-1', { name: 'ANNUAL' })).rejects.toThrow(ConflictException)
    expect(mockPlanType.update).not.toHaveBeenCalled()
  })

  it('update() should throw on db error', async () => {
    mockPlanType.findFirst.mockResolvedValue(mockRecord)
    mockPlanType.update.mockRejectedValue(new Error('db error'))
    await expect(repository.update('uuid-1', { description: 'x' })).rejects.toThrow('db error')
  })

  it('delete() should soft delete and return success message', async () => {
    mockPlanType.update.mockResolvedValue({})
    expect(await repository.delete('uuid-1')).toEqual({ message: 'Deleted successfully' })
    expect(mockPlanType.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPlanType.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('uuid-1')).rejects.toThrow('db error')
  })
})
