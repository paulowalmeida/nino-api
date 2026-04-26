import { ConflictException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PlanTypeRepository } from './plan-type.repository'

describe(PlanTypeRepository.name, () => {
  let repository: PlanTypeRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockPlanType = {
    id: 'uuid-1',
    name: 'ACTIVE',
    description: 'Active invoice',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPrismaService = {
    planType: {
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
        PlanTypeRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<PlanTypeRepository>(PlanTypeRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return invoice statuses array', async () => {
    mockPrismaService.planType.findMany.mockResolvedValue([
      mockPlanType,
    ])

    const result = await repository.getAll()

    expect(result).toEqual([mockPlanType])
    expect(prismaService.planType.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    })
  })

  it('getAll() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.planType.findMany.mockRejectedValue(error)

    await repository.getAll()
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('getById() should return status by id', async () => {
    mockPrismaService.planType.findUnique.mockResolvedValue(
      mockPlanType,
    )

    const result = await repository.getById('uuid-1')

    expect(result).toEqual(mockPlanType)
    expect(prismaService.planType.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('getById() should throw NotFoundException if missing', async () => {
    mockPrismaService.planType.findUnique.mockResolvedValue(null)

    await expect(repository.getById('invalid-id'))
  })

  it('getById() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.planType.findUnique.mockRejectedValue(error)

    await repository.getById('uuid-1')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should create new invoice status', async () => {
    const createData = { name: 'SUSPENDED', description: 'Suspended invoice' }

    mockPrismaService.planType.findUnique.mockResolvedValue(null)
    mockPrismaService.planType.create.mockResolvedValue(mockPlanType)

    const result = await repository.create(createData)

    expect(result).toEqual(mockPlanType)
    expect(prismaService.planType.create).toHaveBeenCalledWith({
      data: createData,
    })
  })

  it('create() should call handleError on error', async () => {
    const error = new Error('DB error')
    const createData = { name: 'ACTIVE' }
    mockPrismaService.planType.create.mockRejectedValue(error)

    await repository.create(createData)
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('create() should throw ConflictException if name exists', async () => {
    mockPrismaService.planType.findUnique.mockResolvedValue(
      mockPlanType,
    )

    await repository.create({ name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('update() should update invoice status', async () => {
    const updateData = { description: 'Updated' }
    const updated = { ...mockPlanType, ...updateData }
    mockPrismaService.planType.update.mockResolvedValue(updated)

    const result = await repository.update('uuid-1', updateData)

    expect(result).toEqual(updated)
    expect(prismaService.planType.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: updateData,
    })
  })

  it('update() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.planType.update.mockRejectedValue(error)

    await repository.update('uuid-1', { name: 'NEW' })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('update() should throw ConflictException if name exists', async () => {
    const another = { ...mockPlanType, id: 'uuid-2' }
    mockPrismaService.planType.findUnique.mockResolvedValue(another)

    await repository.update('uuid-1', { name: 'ACTIVE' })

    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('delete() should remove invoice status', async () => {
    mockPrismaService.planType.delete.mockResolvedValue({
      message: 'Plan Type deleted successfully',
    })

    const result = await repository.delete('uuid-1')

    expect(result).toEqual({ message: 'Plan Type deleted successfully' })
    expect(prismaService.planType.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
    })
  })

  it('delete() should call handleError on error', async () => {
    const error = new Error('DB error')
    mockPrismaService.planType.delete.mockRejectedValue(error)

    await repository.delete('uuid-1')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })
})
