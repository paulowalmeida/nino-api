import { Test, TestingModule } from '@nestjs/testing'

import { OpeningHours } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { OpeningHoursRepository } from './opening-hours.repository'
import { OpeningHoursService } from './opening-hours.service'

describe(OpeningHoursService.name, () => {
  let service: OpeningHoursService

  const mockOpeningHours: OpeningHours = {
    id: 'oh-1',
    tenantId: 'tenant-1',
    dayOfWeek: 1,
    openTime: '08:00',
    closeTime: '18:00',
    isOpen: true,
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
    OpeningHoursRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    findItem: jest.fn().mockResolvedValue(mockOpeningHours),
    insert: jest.fn().mockResolvedValue(mockOpeningHours),
    updateItem: jest.fn().mockResolvedValue(mockOpeningHours),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpeningHoursService,
        { provide: OpeningHoursRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<OpeningHoursService>(OpeningHoursService)
  })

  it('getAll() should return paginated opening hours ordered by day', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockOpeningHours],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll('tenant-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      order: { target: 'dayOfWeek', direction: 'asc' },
      page: 1,
      size: 10,
    })
    expect(result.data).toEqual([mockOpeningHours])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return opening hours by id', async () => {
    const result = await service.getById('oh-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({ where: { id: 'oh-1' } })
    expect(result).toEqual(mockOpeningHours)
  })

  it('create() should create opening hours', async () => {
    const dto = {
      tenantId: 'tenant-1',
      dayOfWeek: 1,
      openTime: '08:00',
      closeTime: '18:00',
    }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto })
    expect(result).toEqual(mockOpeningHours)
  })

  it('update() should update opening hours', async () => {
    const dto = { isOpen: false }
    const result = await service.update('oh-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'oh-1' },
      data: dto,
    })
    expect(result).toEqual(mockOpeningHours)
  })

  it('delete() should soft delete with id object', async () => {
    const result = await service.delete('oh-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'oh-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
