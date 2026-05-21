import { Test, TestingModule } from '@nestjs/testing'

import { ProductCategory } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { ProductCategoryController } from './product-category.controller'
import { ProductCategoryService } from './product-category.service'

describe(ProductCategoryController.name, () => {
  let controller: ProductCategoryController

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

  const mockService: Pick<
    ProductCategoryService,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest
      .fn()
      .mockResolvedValue({ data: [mockCategory], pagination: mockMeta }),
    getById: jest.fn().mockResolvedValue(mockCategory),
    create: jest.fn().mockResolvedValue(mockCategory),
    update: jest.fn().mockResolvedValue(mockCategory),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductCategoryController],
      providers: [
        { provide: ProductCategoryService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<ProductCategoryController>(ProductCategoryController)
  })

  it('getAll() should return paginated categories for tenant', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll('tenant-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('tenant-1', query)
    expect(result.data).toEqual([mockCategory])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return a category by id', async () => {
    const result = await controller.getById('cat-1')
    expect(mockService.getById).toHaveBeenCalledWith('cat-1')
    expect(result).toEqual(mockCategory)
  })

  it('create() should pass tenantId from param', async () => {
    const dto = { name: 'Burgers' }
    const result = await controller.create('tenant-1', dto)
    expect(mockService.create).toHaveBeenCalledWith(dto, { tenantId: 'tenant-1' })
    expect(result).toEqual(mockCategory)
  })

  it('update() should update a category', async () => {
    const dto = { name: 'Updated' }
    const result = await controller.update('cat-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('cat-1', dto)
    expect(result).toEqual(mockCategory)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('cat-1')
    expect(mockService.delete).toHaveBeenCalledWith('cat-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
