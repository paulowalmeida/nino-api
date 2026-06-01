import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CompanyResponsibleRepository } from './company-responsible.repository'

describe(CompanyResponsibleRepository.name, () => {
  let repository: CompanyResponsibleRepository

  const mockPrisma = { companyResponsible: {} }
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
        CompanyResponsibleRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    repository = module.get<CompanyResponsibleRepository>(
      CompanyResponsibleRepository,
    )
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
