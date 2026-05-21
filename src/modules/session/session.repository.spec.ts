import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { SessionRepository } from './session.repository'

describe(SessionRepository.name, () => {
  let repository: SessionRepository

  const mockPrisma = { session: {} }
  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>(),
  }
  const mockPaginationService: Pick<PaginationService, 'paginate'> = {
    paginate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        { provide: PaginationService, useValue: mockPaginationService },
      ],
    }).compile()

    repository = module.get<SessionRepository>(SessionRepository)
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
