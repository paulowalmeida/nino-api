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
    'findItem' | 'exists' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findItem: jest.fn().mockResolvedValue(mockSettings),
    exists: jest.fn(),
    insert: jest.fn().mockResolvedValue(mockSettings),
    updateItem: jest.fn().mockResolvedValue(mockSettings),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getByTenantId() should find settings by tenantId', async () => {
    const result = await service.getByTenantId('tenant-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
    })
    expect(result).toEqual(mockSettings)
  })

  it('upsert() should update when settings already exist', async () => {
    ;(mockRepo.exists as jest.Mock).mockResolvedValue(true)
    const dto = { isDeliveryEnabled: false }
    const result = await service.upsert('tenant-1', dto)
    expect(mockRepo.exists).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
    })
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      data: dto,
    })
    expect(result).toEqual(mockSettings)
  })

  it('upsert() should insert when settings do not exist', async () => {
    ;(mockRepo.exists as jest.Mock).mockResolvedValue(false)
    const dto = { isDeliveryEnabled: true }
    const result = await service.upsert('tenant-1', dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: { tenantId: 'tenant-1', ...dto },
    })
    expect(result).toEqual(mockSettings)
  })

  it('delete() should soft delete with id object', async () => {
    const result = await service.delete('settings-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'settings-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
