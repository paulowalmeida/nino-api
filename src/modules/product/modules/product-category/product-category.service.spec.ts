import { Test, TestingModule } from '@nestjs/testing'

import { ProductCategory } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { ProductCategoryRepository } from './product-category.repository'
import { ProductCategoryService } from './product-category.service'

describe(ProductCategoryService.name, () => {
  let service: ProductCategoryService

  const mockCategory: ProductCategory = {
    id: 'cat-1',
    name: 'Burgers',
    description: null,
    position: 0,
    tenantId: 'tenant-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockRepo: Pick<
    ProductCategoryRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    findItem: jest.fn().mockResolvedValue(mockCategory),
    insert: jest.fn().mockResolvedValue(mockCategory),
    updateItem: jest.fn().mockResolvedValue(mockCategory),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryService,
        { provide: ProductCategoryRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<ProductCategoryService>(ProductCategoryService)
  })

  it('getAll() should return paginated categories for tenant', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockCategory],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll('tenant-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      order: { target: 'position', direction: 'asc' },
      page: 1,
      size: 10,
    })
    expect(result.data).toEqual([mockCategory])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should call findItem with id', async () => {
    const result = await service.getById('cat-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({ where: { id: 'cat-1' } })
    expect(result).toEqual(mockCategory)
  })

  it('create() should call insert merging dto and extra', async () => {
    const dto = { name: 'Burgers' }
    const result = await service.create(dto, { tenantId: 'tenant-1' })
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: { name: 'Burgers', tenantId: 'tenant-1' },
    })
    expect(result).toEqual(mockCategory)
  })

  it('update() should call updateItem with id and dto', async () => {
    const dto = { name: 'Updated' }
    const result = await service.update('cat-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: dto,
    })
    expect(result).toEqual(mockCategory)
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('cat-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'cat-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
