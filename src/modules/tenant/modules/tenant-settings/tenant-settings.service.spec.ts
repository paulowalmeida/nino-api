import { Test, TestingModule } from '@nestjs/testing'

import { TenantSettings } from '@prisma/client'

import { TenantSettingsRepository } from './tenant-settings.repository'
import { TenantSettingsService } from './tenant-settings.service'

describe(TenantSettingsService.name, () => {
  let service: TenantSettingsService

  const mockSettings: TenantSettings = {
    id: 'settings-1',
    tenantId: 'tenant-1',
    requireAccount: false,
    requireCpf: false,
    allowGuestOrder: true,
    deliveryFee: 0 as unknown as TenantSettings['deliveryFee'],
    minOrderAmount: 0 as unknown as TenantSettings['minOrderAmount'],
    deliveryRadius: 0,
    isDeliveryEnabled: true,
    isPickupEnabled: false,
    loyaltyEnabled: false,
    loyaltyPointsPerOrder: 0,
    loyaltyPointValue: 0 as unknown as TenantSettings['loyaltyPointValue'],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockRepo: Pick<
    TenantSettingsRepository,
    'getByTenantId' | 'upsert' | 'delete'
  > = {
    getByTenantId: jest.fn().mockResolvedValue(mockSettings),
    upsert: jest.fn().mockResolvedValue(mockSettings),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSettingsService,
        { provide: TenantSettingsRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<TenantSettingsService>(TenantSettingsService)
  })

  it('getByTenantId() should delegate to repository', async () => {
    const result = await service.getByTenantId('tenant-1')
    expect(mockRepo.getByTenantId).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual(mockSettings)
  })

  it('upsert() should delegate to repository', async () => {
    const dto = { isDeliveryEnabled: false }
    const result = await service.upsert('tenant-1', dto)
    expect(mockRepo.upsert).toHaveBeenCalledWith('tenant-1', dto)
    expect(result).toEqual(mockSettings)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('settings-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('settings-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
