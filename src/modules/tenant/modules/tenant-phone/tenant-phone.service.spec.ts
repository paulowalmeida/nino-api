import { Test, TestingModule } from '@nestjs/testing'

import { TenantPhone } from '@prisma/client'

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

  const mockRepo: Pick<
    TenantPhoneRepository,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockPhone]),
    getById: jest.fn().mockResolvedValue(mockPhone),
    create: jest.fn().mockResolvedValue(mockPhone),
    update: jest.fn().mockResolvedValue(mockPhone),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getAll() should delegate to repository', async () => {
    const result = await service.getAll('tenant-1')
    expect(mockRepo.getAll).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual([mockPhone])
  })

  it('getById() should delegate to repository', async () => {
    const result = await service.getById('phone-1')
    expect(mockRepo.getById).toHaveBeenCalledWith('phone-1')
    expect(result).toEqual(mockPhone)
  })

  it('create() should delegate to repository', async () => {
    const dto = { phone: '11999999999', tenantId: 'tenant-1' }
    const result = await service.create(dto)
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockPhone)
  })

  it('update() should delegate to repository', async () => {
    const dto = { phone: '11888888888' }
    const result = await service.update('phone-1', dto)
    expect(mockRepo.update).toHaveBeenCalledWith('phone-1', dto)
    expect(result).toEqual(mockPhone)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('phone-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('phone-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
