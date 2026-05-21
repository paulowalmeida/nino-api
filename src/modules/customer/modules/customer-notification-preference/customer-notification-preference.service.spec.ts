import { Test, TestingModule } from '@nestjs/testing'

import { CustomerNotificationPreference } from '@prisma/client'

import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'
import { CustomerNotificationPreferenceService } from './customer-notification-preference.service'
import { UpsertCustomerNotificationPreferenceDto } from './dtos/upsert-customer-notification-preference.dto'

describe(CustomerNotificationPreferenceService.name, () => {
  let service: CustomerNotificationPreferenceService

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

  const mockRepo: Pick<
    CustomerNotificationPreferenceRepository,
    'findAll' | 'findItem' | 'updateItem' | 'insert' | 'softDelete'
  > = {
    findAll: jest.fn().mockResolvedValue([mockPreference]),
    findItem: jest.fn().mockResolvedValue(mockPreference),
    updateItem: jest.fn().mockResolvedValue(mockPreference),
    insert: jest.fn().mockResolvedValue(mockPreference),
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

  it('getAll() should call findAll with customerId filter', async () => {
    const result = await service.getAll('customer-1')
    expect(mockRepo.findAll).toHaveBeenCalledWith({
      where: { customerId: 'customer-1' },
    })
    expect(result).toEqual([mockPreference])
  })

  it('upsert() should call updateItem when preference exists', async () => {
    const dto: UpsertCustomerNotificationPreferenceDto = {
      emailEnabled: false,
    }
    const result = await service.upsert('customer-1', 'type-1', dto)
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { customerId: 'customer-1', notificationTypeId: 'type-1' },
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
    expect(result).toEqual(mockPreference)
  })

  it('upsert() should call insert when preference does not exist', async () => {
    ;(mockRepo.findItem as jest.Mock).mockRejectedValueOnce(
      new Error('not found'),
    )
    const dto: UpsertCustomerNotificationPreferenceDto = {
      emailEnabled: false,
    }
    const result = await service.upsert('customer-1', 'type-1', dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: {
        ...dto,
        customerId: 'customer-1',
        notificationTypeId: 'type-1',
      },
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
