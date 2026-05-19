import { Test, TestingModule } from '@nestjs/testing'

import { CustomerNotificationPreference } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'

describe(CustomerNotificationPreferenceRepository.name, () => {
  let repository: CustomerNotificationPreferenceRepository

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

  const mockPrisma = {
    customerNotificationPreference: {
      findMany: jest.fn(),
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
        CustomerNotificationPreferenceRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CustomerNotificationPreferenceRepository>(
      CustomerNotificationPreferenceRepository,
    )
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return preferences for a customer', async () => {
    mockPrisma.customerNotificationPreference.findMany.mockResolvedValue([
      mockPreference,
    ])
    const result = await repository.getAll('customer-1')
    expect(result).toHaveLength(1)
    expect(result[0].customerId).toBe('customer-1')
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.customerNotificationPreference.findMany.mockRejectedValue(
      new Error('db error'),
    )
    await expect(repository.getAll('customer-1')).rejects.toThrow('db error')
  })

  it('upsert() should update when preference already exists', async () => {
    mockPrisma.customerNotificationPreference.findFirst.mockResolvedValue(
      mockPreference,
    )
    mockPrisma.customerNotificationPreference.update.mockResolvedValue(
      mockPreference,
    )
    const dto = { emailEnabled: false }
    const result = await repository.upsert('customer-1', 'type-1', dto)
    expect(
      mockPrisma.customerNotificationPreference.update,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          customerId_notificationTypeId: {
            customerId: 'customer-1',
            notificationTypeId: 'type-1',
          },
        },
        data: dto,
      }),
    )
    expect(result).toEqual(mockPreference)
  })

  it('upsert() should create when preference does not exist', async () => {
    mockPrisma.customerNotificationPreference.findFirst.mockResolvedValue(null)
    mockPrisma.customerNotificationPreference.create.mockResolvedValue(
      mockPreference,
    )
    const dto = { emailEnabled: false }
    const result = await repository.upsert('customer-1', 'type-1', dto)
    expect(
      mockPrisma.customerNotificationPreference.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: 'customer-1',
          notificationTypeId: 'type-1',
          emailEnabled: false,
        }),
      }),
    )
    expect(result).toEqual(mockPreference)
  })

  it('delete() should soft delete using composite key', async () => {
    mockPrisma.customerNotificationPreference.update.mockResolvedValue({})
    const result = await repository.delete('customer-1', 'type-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(
      mockPrisma.customerNotificationPreference.update,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          customerId_notificationTypeId: {
            customerId: 'customer-1',
            notificationTypeId: 'type-1',
          },
        },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    )
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.customerNotificationPreference.update.mockRejectedValue(
      new Error('db error'),
    )
    await expect(
      repository.delete('customer-1', 'type-1'),
    ).rejects.toThrow('db error')
  })
})
