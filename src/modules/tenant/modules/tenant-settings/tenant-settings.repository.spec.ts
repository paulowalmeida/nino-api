import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { TenantSettings } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { TenantSettingsRepository } from './tenant-settings.repository'

describe(TenantSettingsRepository.name, () => {
  let repository: TenantSettingsRepository

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

  const mockPrisma = {
    tenantSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest
      .fn<never, [unknown, string?]>()
      .mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation(
      (e: unknown): never => { throw e as never },
    )
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSettingsRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<TenantSettingsRepository>(TenantSettingsRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('getByTenantId() should return settings for a tenant', async () => {
    mockPrisma.tenantSettings.findFirst.mockResolvedValue(mockSettings)
    const result = await repository.getByTenantId('tenant-1')
    expect(result.tenantId).toBe('tenant-1')
  })

  it('getByTenantId() should throw NotFoundException when not found', async () => {
    mockPrisma.tenantSettings.findFirst.mockResolvedValue(null)
    await expect(repository.getByTenantId('invalid')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('upsert() should update when settings already exist', async () => {
    mockPrisma.tenantSettings.findFirst.mockResolvedValue(mockSettings)
    mockPrisma.tenantSettings.update.mockResolvedValue(mockSettings)
    const dto = { isDeliveryEnabled: false }
    const result = await repository.upsert('tenant-1', dto)
    expect(mockPrisma.tenantSettings.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1' },
        data: dto,
      }),
    )
    expect(result).toEqual(mockSettings)
  })

  it('upsert() should create when settings do not exist', async () => {
    mockPrisma.tenantSettings.findFirst.mockResolvedValue(null)
    mockPrisma.tenantSettings.create.mockResolvedValue(mockSettings)
    const dto = { isDeliveryEnabled: false }
    const result = await repository.upsert('tenant-1', dto)
    expect(mockPrisma.tenantSettings.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1' }),
      }),
    )
    expect(result).toEqual(mockSettings)
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.tenantSettings.update.mockResolvedValue({})
    const result = await repository.delete('settings-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.tenantSettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.tenantSettings.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('settings-1')).rejects.toThrow('db error')
  })
})
