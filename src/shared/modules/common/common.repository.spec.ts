import { ErrorService } from '@shared/services/error/error.service'
import { IBaseModel } from '@shared/interfaces/base-model.interface'

import { CommonRepository } from './common.repository'

describe(CommonRepository.name, () => {
  let repository: CommonRepository

  const mockModel: IBaseModel = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest
      .fn<never, [unknown, string?]>()
      .mockImplementation((e) => { throw e }),
  }

  beforeEach(() => {
    repository = new CommonRepository(
      mockErrorService as unknown as ErrorService,
      mockModel,
      'Test',
    )
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })
})
