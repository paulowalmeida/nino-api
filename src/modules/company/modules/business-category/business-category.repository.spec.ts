import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { BusinessCategoryQueryDto } from './dtos/business-category-query.dto'
import { BusinessCategoryRepository } from './business-category.repository'

describe(BusinessCategoryRepository.name, () => {
  let repository: BusinessCategoryRepository

  const mockRecord: BusinessCategory = {
    id: 'uuid-1',
    name: 'Pizzaria',
    description: 'Estabelecimento para venda de pizzas',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockQuery: BusinessCategoryQueryDto = { page: 1, size: 20 }

  const mockPrisma = {
    businessCategory: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockPaginationService = {
    getPaginationParams: jest.fn().mockReturnValue({ skip: 0, take: 20 }),
    paginate: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessCategoryRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    repository = module.get<BusinessCategoryRepository>(
      BusinessCategoryRepository,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return paginated response', async () => {
    const paginated = { data: [mockRecord], pagination: {} }
    mockPrisma.businessCategory.findMany.mockResolvedValue([mockRecord])
    mockPrisma.businessCategory.count.mockResolvedValue(1)
    mockPaginationService.paginate.mockReturnValue(paginated)
    const result = await repository.getAll(mockQuery)
    expect(result).toEqual(paginated)
  })

  it('getAll() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.businessCategory.findMany.mockRejectedValue(error)
    mockPrisma.businessCategory.count.mockResolvedValue(0)
    await repository.getAll(mockQuery)
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('getById() should return record by id', async () => {
    mockPrisma.businessCategory.findFirst.mockResolvedValue(mockRecord)
    const result = await repository.getById('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('getById() should call errorService.handle with NotFoundException when not found', async () => {
    mockPrisma.businessCategory.findFirst.mockResolvedValue(null)
    await repository.getById('invalid-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('create() should create and return record', async () => {
    mockPrisma.businessCategory.create.mockResolvedValue(mockRecord)
    const result = await repository.create({ name: 'Pizzaria' })
    expect(result).toEqual(mockRecord)
  })

  it('create() should call errorService.handle on prisma error', async () => {
    const error = new Error('db error')
    mockPrisma.businessCategory.create.mockRejectedValue(error)
    await repository.create({ name: 'Pizzaria' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('update() should update and return record', async () => {
    const updated: BusinessCategory = { ...mockRecord, description: 'Updated' }
    mockPrisma.businessCategory.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.businessCategory.update.mockResolvedValue(updated)
    const result = await repository.update('uuid-1', { description: 'Updated' })
    expect(result).toEqual(updated)
  })

  it('update() should call errorService.handle with NotFoundException when not found', async () => {
    mockPrisma.businessCategory.findFirst.mockResolvedValue(null)
    await repository.update('uuid-1', { name: 'Pizza' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('update() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.businessCategory.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.businessCategory.update.mockRejectedValue(error)
    await repository.update('uuid-1', { description: 'x' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should soft delete and return message', async () => {
    mockPrisma.businessCategory.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.businessCategory.update.mockResolvedValue(undefined)
    const result = await repository.delete('uuid-1')
    expect(result).toEqual({ message: 'Business Category deleted successfully' })
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.businessCategory.findFirst.mockResolvedValue(mockRecord)
    mockPrisma.businessCategory.update.mockRejectedValue(error)
    await repository.delete('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
