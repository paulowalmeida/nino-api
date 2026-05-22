import { Test, TestingModule } from '@nestjs/testing'

import { CommonRepository } from './common.repository'
import { CommonService } from './common.service'
import { CreateCommonDto } from './dtos/create-common.dto'
import { UpdateCommonDto } from './dtos/update-common.dto'
import { CommonEntity } from './types/common-entity.type'

describe(CommonService.name, () => {
  let service: CommonService

  const mockEntity: CommonEntity = {
    id: 'uuid-1',
    name: 'Test',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockRepo: Pick<
    CommonRepository,
    | 'findAll'
    | 'findAllPaginated'
    | 'findItem'
    | 'insert'
    | 'updateItem'
    | 'softDelete'
  > = {
    findAll: jest.fn().mockResolvedValue([mockEntity]),
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockEntity], pagination: {} }),
    findItem: jest.fn().mockResolvedValue(mockEntity),
    insert: jest.fn().mockResolvedValue(mockEntity),
    updateItem: jest.fn().mockResolvedValue(mockEntity),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommonService,
        { provide: CommonRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CommonService>(CommonService)
  })

  it('getAll() should call findAll with no order by default', async () => {
    const result = await service.getAll()
    expect(mockRepo.findAll).toHaveBeenCalledWith({ order: undefined })
    expect(result).toEqual([mockEntity])
  })

  it('getAll() should pass order when provided', async () => {
    const order = { target: 'name', direction: 'asc' as const }
    await service.getAll(order)
    expect(mockRepo.findAll).toHaveBeenCalledWith({ order })
  })

  it('getAllPaginated() should call findAllPaginated with provided params', async () => {
    const params = { page: 1, size: 10 }
    await service.getAllPaginated(params)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(params)
  })

  it('getAllPaginated() should use empty object when params is undefined', async () => {
    await service.getAllPaginated()
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({})
  })

  it('getByField() should call findItem with field and value', async () => {
    const result = await service.getByField('id', 'uuid-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({ where: { id: 'uuid-1' } })
    expect(result).toEqual(mockEntity)
  })

  it('create() should call insert with data', async () => {
    const dto: CreateCommonDto = { name: 'Test' }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto })
    expect(result).toEqual(mockEntity)
  })

  it('update() should call updateItem with id and data', async () => {
    const dto: UpdateCommonDto = { description: 'Updated' }
    const result = await service.update('uuid-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: dto,
    })
    expect(result).toEqual(mockEntity)
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('uuid-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'uuid-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
