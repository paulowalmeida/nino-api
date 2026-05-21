import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductResponse } from './types/product-response.type'

describe(ProductController.name, () => {
  let controller: ProductController

  const mockProduct = {
    id: 'prod-1',
    name: 'X-Burguer',
    description: null,
    price: 15.9,
    position: 0,
    tenantId: 'tenant-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: 'cat-1', name: 'Burgers' },
  } as unknown as ProductResponse

  const mockPaginatedResponse = {
    data: [mockProduct],
    pagination: {
      total: 1,
      page: 1,
      size: 10,
      totalPages: 1,
      previousPage: null,
      nextPage: null,
    },
  }

  const mockService: Pick<
    ProductService,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
    getById: jest.fn().mockResolvedValue(mockProduct),
    create: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockResolvedValue(mockProduct),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<ProductController>(ProductController)
  })

  it('getAll() should return paginated products for tenant', async () => {
    const query = { page: 1, size: 10 }
    const result = await controller.getAll('tenant-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('tenant-1', query)
    expect(result).toEqual(mockPaginatedResponse)
  })

  it('getById() should return a product by id', async () => {
    const result = await controller.getById('prod-1')
    expect(mockService.getById).toHaveBeenCalledWith('prod-1')
    expect(result).toEqual(mockProduct)
  })

  it('create() should pass tenantId from param', async () => {
    const dto = { name: 'X-Burguer', price: 15.9, categoryId: 'cat-1' }
    const result = await controller.create('tenant-1', dto)
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', dto)
    expect(result).toEqual(mockProduct)
  })

  it('update() should update a product', async () => {
    const dto = { name: 'Updated' }
    const result = await controller.update('prod-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('prod-1', dto)
    expect(result).toEqual(mockProduct)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('prod-1')
    expect(mockService.delete).toHaveBeenCalledWith('prod-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
