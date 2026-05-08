import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { BaseRepository } from './base.repository'

type MockModel<T> = {
  findMany?: jest.Mock<Promise<T>>
  findFirst?: jest.Mock<Promise<T | null>>
  create?: jest.Mock<Promise<T>>
  update?: jest.Mock<Promise<T>>
}

class ConcreteRepository extends BaseRepository {
  constructor(errorService: ErrorService) {
    super(errorService)
  }

  exposeFindMany<T>(model: MockModel<T>, includeDeleted = false) {
    return this.findMany<T>(
      model as { findMany: (args?: Record<string, unknown>) => Promise<T> },
      includeDeleted,
    )
  }

  exposeGetFirst<T>(model: MockModel<T>, key: string, value: string, includeDeleted = false) {
    return this.getFirst<T, string>(
      model as { findFirst: (args?: Record<string, unknown>) => Promise<T | null> },
      key,
      value,
      includeDeleted,
    )
  }

  exposeInsert<T>(model: MockModel<T>, data: Record<string, unknown>) {
    return this.insert<Record<string, unknown>, T>(
      model as { create: ({ data }: { data: Record<string, unknown> }) => Promise<T> },
      data,
    )
  }

  exposeSoftDelete<T>(model: MockModel<T>, id: string) {
    return this.softDelete(
      model as { update: (args?: Record<string, unknown>) => Promise<T> },
      id,
    )
  }
}

describe(BaseRepository.name, () => {
  let repo: ConcreteRepository

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn().mockImplementation((e: unknown): never => { throw e }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ErrorService, useValue: mockErrorService },
        {
          provide: ConcreteRepository,
          useFactory: (e: ErrorService) => new ConcreteRepository(e),
          inject: [ErrorService],
        },
      ],
    }).compile()

    repo = module.get(ConcreteRepository)
  })

  afterEach(() => jest.clearAllMocks())

  it('findMany() should call findMany with deletedAt: null by default', async () => {
    const model: MockModel<object[]> = { findMany: jest.fn().mockResolvedValue([]) }
    await repo.exposeFindMany(model)
    expect(model.findMany).toHaveBeenCalledWith({ where: { deletedAt: null }, orderBy: undefined })
  })

  it('findMany() should omit deletedAt filter when includeDeleted is true', async () => {
    const model: MockModel<object[]> = { findMany: jest.fn().mockResolvedValue([]) }
    await repo.exposeFindMany(model, true)
    expect(model.findMany).toHaveBeenCalledWith({ where: {}, orderBy: undefined })
  })

  it('findMany() should return the model result', async () => {
    const data = [{ id: '1' }]
    const model: MockModel<object[]> = { findMany: jest.fn().mockResolvedValue(data) }
    expect(await repo.exposeFindMany(model)).toEqual(data)
  })

  it('findMany() should throw when model throws', async () => {
    const model: MockModel<object[]> = { findMany: jest.fn().mockRejectedValue(new Error('db error')) }
    await expect(repo.exposeFindMany(model)).rejects.toThrow('db error')
  })

  it('getFirst() should call findFirst with key/value and deletedAt: null by default', async () => {
    const record = { id: '1' }
    const model: MockModel<typeof record> = { findFirst: jest.fn().mockResolvedValue(record) }
    await repo.exposeGetFirst(model, 'id', '1')
    expect(model.findFirst).toHaveBeenCalledWith({ where: { id: '1', deletedAt: null } })
  })

  it('getFirst() should omit deletedAt filter when includeDeleted is true', async () => {
    const record = { id: '1' }
    const model: MockModel<typeof record> = { findFirst: jest.fn().mockResolvedValue(record) }
    await repo.exposeGetFirst(model, 'id', '1', true)
    expect(model.findFirst).toHaveBeenCalledWith({ where: { id: '1' } })
  })

  it('getFirst() should return the found record', async () => {
    const record = { id: '1' }
    const model: MockModel<typeof record> = { findFirst: jest.fn().mockResolvedValue(record) }
    expect(await repo.exposeGetFirst(model, 'id', '1')).toEqual(record)
  })

  it('getFirst() should throw NotFoundException when record is null', async () => {
    const model: MockModel<object> = { findFirst: jest.fn().mockResolvedValue(null) }
    await expect(repo.exposeGetFirst(model, 'id', 'x')).rejects.toThrow(NotFoundException)
  })

  it('insert() should call create with data and return result', async () => {
    const data = { name: 'test' }
    const created = { id: '1', name: 'test' }
    const model: MockModel<typeof created> = { create: jest.fn().mockResolvedValue(created) }
    expect(await repo.exposeInsert(model, data)).toEqual(created)
    expect(model.create).toHaveBeenCalledWith({ data })
  })

  it('insert() should throw when model throws', async () => {
    const model: MockModel<object> = { create: jest.fn().mockRejectedValue(new Error('db error')) }
    await expect(repo.exposeInsert(model, {})).rejects.toThrow('db error')
  })

  it('softDelete() should call update with deletedAt and return success message', async () => {
    const model: MockModel<object> = { update: jest.fn().mockResolvedValue({}) }
    expect(await repo.exposeSoftDelete(model, 'uuid-1')).toEqual({ message: 'Deleted successfully' })
    expect(model.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('softDelete() should throw when model throws', async () => {
    const model: MockModel<object> = { update: jest.fn().mockRejectedValue(new Error('db error')) }
    await expect(repo.exposeSoftDelete(model, 'uuid-1')).rejects.toThrow('db error')
  })
})
