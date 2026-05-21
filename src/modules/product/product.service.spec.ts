import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { ProductRepository } from './product.repository'
import { ProductService } from './product.service'
import { ProductQueryDto } from './dtos/product-query.dto'
import { CreateProductDto } from './dtos/create-product.dto'
import { UpdateProductDto } from './dtos/update-product.dto'
import { ProductFull } from './types/product-full.type'
import { ProductOrderBy } from './types/product-order-by.type'

describe(ProductService.name, () => {
  let service: ProductService

  const createdAt = new Date()
  const updatedAt = new Date()

  const mockProductFull = {
    id: 'prod-1',
    name: 'X-Burguer',
    description: null,
    price: 15.9,
    position: 0,
    categoryId: 'cat-1',
    tenantId: 'tenant-1',
    isActive: true,
    createdAt,
    updatedAt,
    deletedAt: null,
    category: {
      id: 'cat-1',
      name: 'Burgers',
      description: null,
      position: 0,
      tenantId: 'tenant-1',
      createdAt,
      updatedAt,
      deletedAt: null,
    },
  } as unknown as ProductFull

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockRepo: Pick<
    ProductRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockProductFull], pagination: mockMeta }),
    findItem: jest.fn().mockResolvedValue(mockProductFull),
    insert: jest.fn().mockResolvedValue(mockProductFull),
    updateItem: jest.fn().mockResolvedValue(mockProductFull),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<ProductService>(ProductService)
  })

  it('getAll() should return paginated mapped ProductResponse', async () => {
    const query = {
      page: 1,
      size: 10,
      target: ProductOrderBy.POSITION,
    } as ProductQueryDto
    const result = await service.getAll('tenant-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1' },
        page: 1,
        size: 10,
      }),
    )
    expect(result.pagination).toEqual(mockMeta)
    expect(
      (result.data[0] as Record<string, unknown>).categoryId,
    ).toBeUndefined()
    expect(
      (result.data[0] as Record<string, unknown>).deletedAt,
    ).toBeUndefined()
    expect(result.data[0].category).toEqual({ id: 'cat-1', name: 'Burgers' })
  })

  it('getAll() should include categoryId filter when provided', async () => {
    const query = {
      page: 1,
      size: 10,
      target: ProductOrderBy.POSITION,
      categoryId: 'cat-1',
    } as ProductQueryDto
    await service.getAll('tenant-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', categoryId: 'cat-1' },
      }),
    )
  })

  it('getById() should return mapped ProductResponse', async () => {
    const result = await service.getById('prod-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      include: { category: true },
    })
    expect((result as Record<string, unknown>).categoryId).toBeUndefined()
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('create() should insert with tenantId and return mapped ProductResponse', async () => {
    const dto: CreateProductDto = {
      name: 'X-Burguer',
      price: 15.9,
      categoryId: 'cat-1',
    }
    const result = await service.create('tenant-1', dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: { ...dto, tenantId: 'tenant-1' },
      include: { category: true },
    })
    expect((result as Record<string, unknown>).categoryId).toBeUndefined()
  })

  it('update() should updateItem and return mapped ProductResponse', async () => {
    const dto: UpdateProductDto = { name: 'Updated' }
    const result = await service.update('prod-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: dto,
      include: { category: true },
    })
    expect(result.name).toBe('X-Burguer')
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('prod-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'prod-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
