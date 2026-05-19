import { Test, TestingModule } from '@nestjs/testing'

import { CustomerNotificationPreference } from '@prisma/client'

import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'
import { CustomerNotificationPreferenceService } from './customer-notification-preference.service'

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
    'getAll' | 'upsert' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockPreference]),
    upsert: jest.fn().mockResolvedValue(mockPreference),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getAll() should delegate to repository', async () => {
    const result = await service.getAll('customer-1')
    expect(mockRepo.getAll).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual([mockPreference])
  })

  it('upsert() should delegate to repository', async () => {
    const dto = { emailEnabled: false }
    const result = await service.upsert('customer-1', 'type-1', dto)
    expect(mockRepo.upsert).toHaveBeenCalledWith('customer-1', 'type-1', dto)
    expect(result).toEqual(mockPreference)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('customer-1', 'type-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('customer-1', 'type-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
