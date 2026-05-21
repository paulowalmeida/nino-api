import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { ProductCategoryRepository } from './product-category.repository'

describe(ProductCategoryRepository.name, () => {
  let repository: ProductCategoryRepository

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>(),
  }

  const mockPaginationService: Pick<PaginationService, 'paginate'> = {
    paginate: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoryRepository,
        { provide: PrismaService, useValue: { productCategory: {} } },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    repository = module.get<ProductCategoryRepository>(ProductCategoryRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
