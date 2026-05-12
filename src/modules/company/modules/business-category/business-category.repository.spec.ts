import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
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

  const mockPrisma = {
    businessCategory: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockPaginationService: Pick<
    PaginationService,
    'getPaginationParams' | 'paginate'
  > = {
    getPaginationParams: jest.fn().mockReturnValue({ skip: 0, take: 20 }),
    paginate: jest.fn(),
  }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => {
      throw e
    }),
  }

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

  afterEach(() => jest.clearAllMocks())

  describe('getAll()', () => {
    it('should return paginated response', async () => {
      const paginated = { data: [mockRecord], pagination: {} }
      mockPrisma.businessCategory.findMany.mockResolvedValue([mockRecord])
      mockPrisma.businessCategory.count.mockResolvedValue(1)
      ;(mockPaginationService.paginate as jest.Mock).mockReturnValue(paginated)
      expect(await repository.getAll({ page: 1, size: 20 })).toEqual(paginated)
    })

    it('should throw on db error', async () => {
      mockPrisma.businessCategory.findMany.mockRejectedValue(
        new Error('db error'),
      )
      mockPrisma.businessCategory.count.mockResolvedValue(0)
      await expect(repository.getAll({ page: 1, size: 20 })).rejects.toThrow(
        'db error',
      )
    })
  })

  describe('getById()', () => {
    it('should return record by id', async () => {
      mockPrisma.businessCategory.findFirst.mockResolvedValue(mockRecord)
      expect(await repository.getById('uuid-1')).toEqual(mockRecord)
    })

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.businessCategory.findFirst.mockResolvedValue(null)
      await expect(repository.getById('invalid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('create()', () => {
    it('should create and return record', async () => {
      mockPrisma.businessCategory.create.mockResolvedValue(mockRecord)
      expect(await repository.create({ name: 'Pizzaria' })).toEqual(mockRecord)
      expect(mockPrisma.businessCategory.create).toHaveBeenCalledWith({
        data: { name: 'Pizzaria' },
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.businessCategory.create.mockRejectedValue(
        new Error('db error'),
      )
      await expect(repository.create({ name: 'Pizzaria' })).rejects.toThrow(
        'db error',
      )
    })
  })

  describe('update()', () => {
    it('should update and return record', async () => {
      const updated = { ...mockRecord, description: 'Updated' }
      mockPrisma.businessCategory.update.mockResolvedValue(updated)
      expect(
        await repository.update('uuid-1', { description: 'Updated' }),
      ).toEqual(updated)
      expect(mockPrisma.businessCategory.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { description: 'Updated' },
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.businessCategory.update.mockRejectedValue(
        new Error('db error'),
      )
      await expect(
        repository.update('uuid-1', { description: 'x' }),
      ).rejects.toThrow('db error')
    })
  })

  describe('delete()', () => {
    it('should soft delete and return success message', async () => {
      mockPrisma.businessCategory.update.mockResolvedValue({})
      expect(await repository.delete('uuid-1')).toEqual({
        message: 'Deleted successfully',
      })
    })

    it('should throw on db error', async () => {
      mockPrisma.businessCategory.update.mockRejectedValue(
        new Error('db error'),
      )
      await expect(repository.delete('uuid-1')).rejects.toThrow('db error')
    })
  })
})
