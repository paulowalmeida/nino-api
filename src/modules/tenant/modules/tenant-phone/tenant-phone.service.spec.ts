import { Test, TestingModule } from '@nestjs/testing'

import { TenantPhone } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { TenantPhoneRepository } from './tenant-phone.repository'
import { TenantPhoneService } from './tenant-phone.service'

describe(TenantPhoneService.name, () => {
  let service: TenantPhoneService

  const mockPhone: TenantPhone = {
    id: 'phone-1',
    phone: '11999999999',
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
    TenantPhoneRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    findItem: jest.fn().mockResolvedValue(mockPhone),
    insert: jest.fn().mockResolvedValue(mockPhone),
    updateItem: jest.fn().mockResolvedValue(mockPhone),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPhoneService,
        { provide: TenantPhoneRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<TenantPhoneService>(TenantPhoneService)
  })

  it('getAll() should return paginated phones for tenant', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockPhone],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll('tenant-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      order: { target: 'createdAt', direction: 'asc' },
      page: 1,
      size: 10,
    })
    expect(result.data).toEqual([mockPhone])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return phone by id', async () => {
    const result = await service.getById('phone-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({ where: { id: 'phone-1' } })
    expect(result).toEqual(mockPhone)
  })

  it('create() should create tenant phone', async () => {
    const dto = { phone: '11999999999', tenantId: 'tenant-1' }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto })
    expect(result).toEqual(mockPhone)
  })

  it('update() should update tenant phone', async () => {
    const dto = { phone: '11888888888' }
    const result = await service.update('phone-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'phone-1' },
      data: dto,
    })
    expect(result).toEqual(mockPhone)
  })

  it('delete() should soft delete with id object', async () => {
    const result = await service.delete('phone-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'phone-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
