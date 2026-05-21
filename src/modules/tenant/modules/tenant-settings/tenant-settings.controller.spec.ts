import { Test, TestingModule } from '@nestjs/testing'

import { TenantSettings } from '@prisma/client'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { TenantSettingsController } from './tenant-settings.controller'
import { TenantSettingsService } from './tenant-settings.service'

describe(TenantSettingsController.name, () => {
  let controller: TenantSettingsController

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
    allowSharedStaff: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService: Pick<
    TenantSettingsService,
    'getByTenantId' | 'upsert' | 'delete'
  > = {
    getByTenantId: jest.fn().mockResolvedValue(mockSettings),
    upsert: jest.fn().mockResolvedValue(mockSettings),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantSettingsController],
      providers: [{ provide: TenantSettingsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantSettingsController>(TenantSettingsController)
  })

  it('getByTenantId() should return settings for tenant', async () => {
    const result = await controller.getByTenantId('tenant-1')
    expect(mockService.getByTenantId).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual(mockSettings)
  })

  it('upsert() should upsert settings for tenant', async () => {
    const dto = { isDeliveryEnabled: false }
    const result = await controller.upsert('tenant-1', dto)
    expect(mockService.upsert).toHaveBeenCalledWith('tenant-1', dto)
    expect(result).toEqual(mockSettings)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('settings-1')
    expect(mockService.delete).toHaveBeenCalledWith('settings-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
