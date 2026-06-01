import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerNotificationPreferenceRepository } from './customer-notification-preference.repository'

describe(CustomerNotificationPreferenceRepository.name, () => {
  let repository: CustomerNotificationPreferenceRepository

  const mockPrisma = { customerNotificationPreference: {} }
  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => {
      throw e
    }),
  }

  beforeEach(async () => {
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

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
