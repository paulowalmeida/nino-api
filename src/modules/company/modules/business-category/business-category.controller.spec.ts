import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { BusinessCategoryController } from './business-category.controller'
import { BusinessCategoryService } from './business-category.service'
import { BusinessCategoryPaginatedResponse } from './types/business-category-paginated-response.type'

describe(BusinessCategoryController.name, () => {
  let controller: BusinessCategoryController

  const mockRecord: BusinessCategory = {
    id: 'uuid-1',
    name: 'Pizzaria',
    description: 'Estabelecimento para venda de pizzas',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPaginated: BusinessCategoryPaginatedResponse = {
    data: [mockRecord],
    pagination: {
      page: 1,
      size: 10,
      total: 1,
      totalPages: 1,
      previousPage: null,
      nextPage: null,
    },
  }

  const mockService: Pick<
    BusinessCategoryService,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessCategoryController],
      providers: [{ provide: BusinessCategoryService, useValue: mockService }],
    }).compile()

    controller = module.get<BusinessCategoryController>(
      BusinessCategoryController,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return paginated response', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 20, direction: 'asc' }
    ;(mockService.getAll as jest.Mock).mockResolvedValue(mockPaginated)
    const result = await controller.getAll(query)
    expect(result).toEqual(mockPaginated)
  })

  it('getById() should return record', async () => {
    ;(mockService.getById as jest.Mock).mockResolvedValue(mockRecord)
    const result = await controller.getById('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('create() should return created record', async () => {
    ;(mockService.create as jest.Mock).mockResolvedValue(mockRecord)
    const result = await controller.create({ name: 'Pizzaria' })
    expect(result).toEqual(mockRecord)
  })

  it('update() should return updated record', async () => {
    const updated: BusinessCategory = { ...mockRecord, description: 'Updated' }
    ;(mockService.update as jest.Mock).mockResolvedValue(updated)
    const result = await controller.update('uuid-1', { description: 'Updated' })
    expect(result).toEqual(updated)
  })

  it('delete() should return success message', async () => {
    ;(mockService.delete as jest.Mock).mockResolvedValue({
      message: 'Business Category deleted successfully',
    })
    const result = await controller.delete('uuid-1')
    expect(result).toEqual({
      message: 'Business Category deleted successfully',
    })
  })
})
