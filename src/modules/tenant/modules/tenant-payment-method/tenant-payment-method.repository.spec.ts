import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { TenantPaymentMethodRepository } from './tenant-payment-method.repository'

describe(TenantPaymentMethodRepository.name, () => {
  let repository: TenantPaymentMethodRepository

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>(),
  }
  const mockPaginationService: jest.Mocked<
    Pick<PaginationService, 'paginate' | 'getPaginationParams'>
  > = {
    paginate: jest.fn(),
    getPaginationParams: jest.fn().mockReturnValue({ skip: 0, take: 20 }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPaymentMethodRepository,
        { provide: PrismaService, useValue: { tenantPaymentMethod: {} } },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    repository = module.get<TenantPaymentMethodRepository>(
      TenantPaymentMethodRepository,
    )
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
