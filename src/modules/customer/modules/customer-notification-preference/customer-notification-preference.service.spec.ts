import { Test, TestingModule } from '@nestjs/testing'

import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'
import { CustomerNotificationPreferenceService } from './customer-notification-preference.service'
import { UpsertCustomerNotificationPreferenceDto } from './dtos/upsert-customer-notification-preference.dto'
import { CustomerNotificationPreferenceFull } from './types/customer-notification-preference-full.type'
import { CustomerNotificationPreferenceResponse } from './types/customer-notification-preference-response.type'

describe(CustomerNotificationPreferenceService.name, () => {
  let service: CustomerNotificationPreferenceService

  const mockNotificationType = {
    id: 'type-1',
    name: 'ORDER',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPreferenceFull: CustomerNotificationPreferenceFull = {
    id: 'pref-1',
    customerId: 'customer-1',
    notificationTypeId: 'type-1',
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    notificationType: mockNotificationType,
  }

  const mockPreference: CustomerNotificationPreferenceResponse = {
    id: 'pref-1',
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    createdAt: mockPreferenceFull.createdAt,
    updatedAt: mockPreferenceFull.updatedAt,
    deletedAt: null,
    notificationType: mockNotificationType,
  }

  const include = { notificationType: true }

  const mockRepo: Pick<
    CustomerNotificationPreferenceRepository,
    'findAll' | 'findItem' | 'updateItem' | 'insert' | 'softDelete'
  > = {
    findAll: jest.fn().mockResolvedValue([mockPreferenceFull]),
    findItem: jest.fn().mockResolvedValue(mockPreferenceFull),
    updateItem: jest.fn().mockResolvedValue(mockPreferenceFull),
    insert: jest.fn().mockResolvedValue(mockPreferenceFull),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerNotificationPreferenceService,
        {
          provide: CustomerNotificationPreferenceRepository,
          useValue: mockRepo,
        },
      ],
    }).compile()

    service = module.get<CustomerNotificationPreferenceService>(
      CustomerNotificationPreferenceService,
    )
  })

  it('getAll() should call findAll with include and return mapped response', async () => {
    const result = await service.getAll('customer-1')
    expect(mockRepo.findAll).toHaveBeenCalledWith({
      where: { customerId: 'customer-1' },
      include,
    })
    expect(result).toEqual([mockPreference])
  })

  it('upsert() should call updateItem when preference exists', async () => {
    const dto: UpsertCustomerNotificationPreferenceDto = { emailEnabled: false }
    await service.upsert('customer-1', 'type-1', dto)
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { customerId: 'customer-1', notificationTypeId: 'type-1' },
      include,
    })
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: {
        customerId_notificationTypeId: {
          customerId: 'customer-1',
          notificationTypeId: 'type-1',
        },
      },
      data: dto,
    })
  })

  it('upsert() should call insert with include when preference does not exist', async () => {
    ;(mockRepo.findItem as jest.Mock).mockRejectedValueOnce(
      new Error('not found'),
    )
    const dto: UpsertCustomerNotificationPreferenceDto = { emailEnabled: false }
    const result = await service.upsert('customer-1', 'type-1', dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: { ...dto, customerId: 'customer-1', notificationTypeId: 'type-1' },
      include,
    })
    expect(result).toEqual(mockPreference)
  })

  it('delete() should call softDelete with composite key', async () => {
    const result = await service.delete('customer-1', 'type-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({
      customerId_notificationTypeId: {
        customerId: 'customer-1',
        notificationTypeId: 'type-1',
      },
    })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
