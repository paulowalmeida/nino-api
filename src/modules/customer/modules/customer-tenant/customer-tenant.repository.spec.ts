import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerTenantRepository } from './customer-tenant.repository'

describe(CustomerTenantRepository.name, () => {
  let repository: CustomerTenantRepository

  const mockPrisma = { customerTenant: {} }
  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest
      .fn<never, [unknown, string?]>()
      .mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerTenantRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CustomerTenantRepository>(CustomerTenantRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
