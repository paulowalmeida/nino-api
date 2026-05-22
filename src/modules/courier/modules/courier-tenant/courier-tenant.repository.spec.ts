import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CourierTenantRepository } from './courier-tenant.repository'

describe(CourierTenantRepository.name, () => {
  let repository: CourierTenantRepository

  const mockPrisma = {
    courierTenant: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => {
      throw e
    }),
  }

  const mockPaginationService: jest.Mocked<
    Pick<PaginationService, 'paginate' | 'getPaginationParams'>
  > = {
    paginate: jest.fn(),
    getPaginationParams: jest.fn().mockReturnValue({ skip: 0, take: 20 }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierTenantRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    repository = module.get<CourierTenantRepository>(CourierTenantRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
