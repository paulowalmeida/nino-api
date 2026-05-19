import { Test, TestingModule } from '@nestjs/testing'

import { CustomerNotificationPreference } from '@prisma/client'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerOwnerGuard } from '../../guards/customer-owner.guard'
import { CustomerNotificationPreferenceController } from './customer-notification-preference.controller'
import { CustomerNotificationPreferenceService } from './customer-notification-preference.service'

describe(CustomerNotificationPreferenceController.name, () => {
  let controller: CustomerNotificationPreferenceController

  const mockPreference: CustomerNotificationPreference = {
    id: 'pref-1',
    customerId: 'customer-1',
    notificationTypeId: 'type-1',
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockService: Pick<
    CustomerNotificationPreferenceService,
    'getAll' | 'upsert' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockPreference]),
    upsert: jest.fn().mockResolvedValue(mockPreference),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerNotificationPreferenceController],
      providers: [
        {
          provide: CustomerNotificationPreferenceService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller =
      module.get<CustomerNotificationPreferenceController>(
        CustomerNotificationPreferenceController,
      )
  })

  it('getAll() should return preferences for customer', async () => {
    const result = await controller.getAll('customer-1')
    expect(mockService.getAll).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual([mockPreference])
  })

  it('upsert() should delegate with all params', async () => {
    const dto = { emailEnabled: false }
    const result = await controller.upsert('customer-1', 'type-1', dto)
    expect(mockService.upsert).toHaveBeenCalledWith(
      'customer-1',
      'type-1',
      dto,
    )
    expect(result).toEqual(mockPreference)
  })

  it('delete() should delegate with both ids', async () => {
    const result = await controller.delete('customer-1', 'type-1')
    expect(mockService.delete).toHaveBeenCalledWith('customer-1', 'type-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
