import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory } from '@prisma/client'

import { BusinessCategoryRepository } from './business-category.repository'
import { BusinessCategoryService } from './business-category.service'

describe(BusinessCategoryService.name, () => {
  let service: BusinessCategoryService

  const mockRecord: BusinessCategory = {
    id: 'uuid-1',
    name: 'Pizzaria',
    description: 'Estabelecimento para venda de pizzas',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockRepo = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessCategoryService,
        { provide: BusinessCategoryRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<BusinessCategoryService>(BusinessCategoryService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getAll() should return array', async () => {
    mockRepo.getAll.mockResolvedValue([mockRecord])
    const result = await service.getAll()
    expect(result).toEqual([mockRecord])
  })

  it('getById() should return record by id', async () => {
    mockRepo.getById.mockResolvedValue(mockRecord)
    const result = await service.getById('uuid-1')
    expect(result).toEqual(mockRecord)
  })

  it('create() should create and return record', async () => {
    mockRepo.create.mockResolvedValue(mockRecord)
    const result = await service.create({ name: 'Pizzaria' })
    expect(result).toEqual(mockRecord)
  })

  it('update() should update and return record', async () => {
    const updated: BusinessCategory = { ...mockRecord, description: 'Updated' }
    mockRepo.update.mockResolvedValue(updated)
    const result = await service.update('uuid-1', { description: 'Updated' })
    expect(result).toEqual(updated)
  })

  it('delete() should return success message', async () => {
    mockRepo.delete.mockResolvedValue({
      message: 'Business Category deleted successfully',
    })
    const result = await service.delete('uuid-1')
    expect(result).toEqual({ message: 'Business Category deleted successfully' })
  })
})
