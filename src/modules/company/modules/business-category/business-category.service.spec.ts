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

  const mockRepo: Pick<
    BusinessCategoryRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockRecord], total: 1 }),
    findItem: jest.fn().mockResolvedValue(mockRecord),
    insert: jest.fn().mockResolvedValue(mockRecord),
    updateItem: jest.fn().mockResolvedValue(mockRecord),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Business Category deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessCategoryService,
        { provide: BusinessCategoryRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<BusinessCategoryService>(BusinessCategoryService)
  })

  it('getAll() should call findAllPaginated without order when target is absent', async () => {
    const result = await service.getAll({})
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: undefined,
      size: undefined,
      order: undefined,
    })
    expect(result).toEqual({ data: [mockRecord], total: 1 })
  })

  it('getAll() should pass order when target is provided', async () => {
    await service.getAll({ target: 'name', direction: 'desc' })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: undefined,
      size: undefined,
      order: { target: 'name', direction: 'desc' },
    })
  })

  it('getById() should return record by id', async () => {
    const result = await service.getById('uuid-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({ where: { id: 'uuid-1' } })
    expect(result).toEqual(mockRecord)
  })

  it('create() should create and return record', async () => {
    const dto = { name: 'Pizzaria' }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto })
    expect(result).toEqual(mockRecord)
  })

  it('update() should update and return record', async () => {
    const dto = { description: 'Updated' }
    const result = await service.update('uuid-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: dto,
    })
    expect(result).toEqual(mockRecord)
  })

  it('delete() should return success message', async () => {
    const result = await service.delete('uuid-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'uuid-1' })
    expect(result).toEqual({
      message: 'Business Category deleted successfully',
    })
  })
})
