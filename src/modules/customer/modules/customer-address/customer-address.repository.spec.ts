import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerAddressRepository } from './customer-address.repository'

describe(CustomerAddressRepository.name, () => {
  let repository: CustomerAddressRepository

  const mockPrisma = { customerAddress: {} }
  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => {
      throw e
    }),
  }
  const mockPaginationService: Pick<
    PaginationService,
    'getPaginationParams' | 'paginate'
  > = {
    getPaginationParams: jest.fn(),
    paginate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerAddressRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    repository = module.get<CustomerAddressRepository>(
      CustomerAddressRepository,
    )
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
