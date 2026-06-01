import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { IBaseModel } from '@shared/interfaces/base-model.interface'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { BaseRepository, SOFT_DELETE_MESSAGE } from './base.repository'

type Item = { id: string; name: string; deletedAt: Date | null }

class ConcreteRepository extends BaseRepository<IBaseModel> {
  constructor(
    model: IBaseModel,
    errorService: ErrorService,
    paginationService?: PaginationService,
  ) {
    super(errorService, model, 'Item', paginationService)
  }
}

class ConcreteRepositoryDefault extends BaseRepository<IBaseModel> {
  constructor(model: IBaseModel, errorService: ErrorService) {
    super(errorService, model)
  }
}

describe(BaseRepository.name, () => {
  let repo: ConcreteRepository
  let repoNoPagination: ConcreteRepository
  let mockModel: IBaseModel
  let errorService: ErrorService
  let paginationService: PaginationService

  let repoDefaultName: ConcreteRepositoryDefault
  const item: Item = { id: '1', name: 'test', deletedAt: null }

  beforeEach(async () => {
    mockModel = {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorService, PaginationService],
    }).compile()

    errorService = module.get<ErrorService>(ErrorService)
    paginationService = module.get<PaginationService>(PaginationService)
    repo = new ConcreteRepository(mockModel, errorService, paginationService)
    repoNoPagination = new ConcreteRepository(mockModel, errorService)
    repoDefaultName = new ConcreteRepositoryDefault(mockModel, errorService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('findAll()', () => {
    it('should call findMany with deletedAt: null by default', async () => {
      jest.mocked(mockModel.findMany).mockResolvedValue([item])
      const result = await repo.findAll<Item>()
      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null } }),
      )
      expect(result).toEqual([item])
    })

    it('should omit deletedAt filter when ignoreDeleted is true', async () => {
      jest.mocked(mockModel.findMany).mockResolvedValue([item])
      await repo.findAll<Item>({
        ignoreDeleted: true,
        where: { tenantId: 't1' },
      })
      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 't1' } }),
      )
    })

    it('should pass orderBy when order param is provided', async () => {
      jest.mocked(mockModel.findMany).mockResolvedValue([item])
      await repo.findAll<Item>({ order: { target: 'name', direction: 'asc' } })
      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      )
    })

    it('should pass undefined orderBy when no order param', async () => {
      jest.mocked(mockModel.findMany).mockResolvedValue([])
      await repo.findAll<Item>()
      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: undefined }),
      )
    })
  })

  describe('findAllPaginated()', () => {
    it('should return paginated response with correct meta', async () => {
      jest.mocked(mockModel.findMany).mockResolvedValue([item])
      jest.mocked(mockModel.count).mockResolvedValue(1)
      const result = await repo.findAllPaginated<Item>({ page: 1, size: 10 })
      expect(result.data).toEqual([item])
      expect(result.pagination.total).toBe(1)
      expect(result.pagination.page).toBe(1)
    })

    it('should apply where and order filters', async () => {
      jest.mocked(mockModel.findMany).mockResolvedValue([item])
      jest.mocked(mockModel.count).mockResolvedValue(1)
      await repo.findAllPaginated<Item>({
        page: 1,
        size: 5,
        where: { name: 'test' },
        order: { target: 'name', direction: 'desc' },
      })
      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: 'test', deletedAt: null },
          orderBy: { name: 'desc' },
          skip: 0,
          take: 5,
        }),
      )
    })

    it('should throw when paginationService is not provided', async () => {
      await expect(
        repoNoPagination.findAllPaginated<Item>({ page: 1, size: 10 }),
      ).rejects.toThrow('PaginationService not provided')
    })

    it('should use default page 1 and size 10 when not provided', async () => {
      jest.mocked(mockModel.findMany).mockResolvedValue([item])
      jest.mocked(mockModel.count).mockResolvedValue(1)
      const result = await repo.findAllPaginated<Item>({})
      expect(result.data).toEqual([item])
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.size).toBe(10)
    })
  })

  describe('findItem()', () => {
    it('should return the item when found', async () => {
      jest.mocked(mockModel.findFirst).mockResolvedValue(item)
      const result = await repo.findItem<Item>({ where: { id: '1' } })
      expect(result).toEqual(item)
      expect(mockModel.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1', deletedAt: null } }),
      )
    })

    it('should throw NotFoundException when record is not found', async () => {
      jest.mocked(mockModel.findFirst).mockResolvedValue(null)
      await expect(
        repo.findItem<Item>({ where: { id: '999' } }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should respect ignoreDeleted flag', async () => {
      jest.mocked(mockModel.findFirst).mockResolvedValue(item)
      await repo.findItem<Item>({ where: { id: '1' }, ignoreDeleted: true })
      expect(mockModel.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      )
    })
  })

  describe('exists()', () => {
    it('should return true when a matching record is found', async () => {
      jest.mocked(mockModel.count).mockResolvedValue(1)
      const result = await repo.exists({ where: { id: '1' } })
      expect(result).toBe(true)
    })

    it('should return false when no matching record is found', async () => {
      jest.mocked(mockModel.count).mockResolvedValue(0)
      const result = await repo.exists({ where: { id: '999' } })
      expect(result).toBe(false)
    })
  })

  describe('insert()', () => {
    it('should call model.create and return the entity', async () => {
      jest.mocked(mockModel.create).mockResolvedValue(item)
      const result = await repo.insert<Omit<Item, 'id'>, Item>({
        data: { name: 'test', deletedAt: null },
      })
      expect(mockModel.create).toHaveBeenCalled()
      expect(result).toEqual(item)
    })
  })

  describe('updateItem()', () => {
    it('should call model.update and return the updated entity', async () => {
      const updated = { ...item, name: 'updated' }
      jest.mocked(mockModel.update).mockResolvedValue(updated)
      const result = await repo.updateItem<Partial<Item>, Item>({
        where: { id: '1' },
        data: { name: 'updated' },
      })
      expect(mockModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: { name: 'updated' },
        }),
      )
      expect(result).toEqual(updated)
    })
  })

  describe('deleteMany()', () => {
    it('should call model.deleteMany with the given where', async () => {
      jest.mocked(mockModel.deleteMany).mockResolvedValue({ count: 1 })
      await repo.deleteMany({ tenantId: 'tenant-1' })
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
      })
    })
  })

  describe('softDelete()', () => {
    it('should set deletedAt and return success message', async () => {
      jest.mocked(mockModel.update).mockResolvedValue(item)
      const result = await repo.softDelete({ id: '1' })
      expect(mockModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
      expect(result).toEqual({ message: SOFT_DELETE_MESSAGE })
    })
  })

  describe('default entityName', () => {
    it('should use "Record" as default entity name in NotFoundException message', async () => {
      jest.mocked(mockModel.findFirst).mockResolvedValue(null)
      await expect(
        repoDefaultName.findItem<Item>({ where: { id: '1' } }),
      ).rejects.toThrow('Record not found')
    })
  })

  describe('error handling', () => {
    it('should delegate errors to errorService.handle', async () => {
      const err = new Error('db error')
      jest.mocked(mockModel.findMany).mockRejectedValue(err)
      const handleSpy = jest
        .spyOn(errorService, 'handle')
        .mockImplementation(() => {
          throw new NotFoundException()
        })
      await expect(repo.findAll()).rejects.toThrow(NotFoundException)
      expect(handleSpy).toHaveBeenCalledWith(err)
    })

    it('should re-throw HttpException without wrapping', async () => {
      const err = new NotFoundException('already http')
      jest.mocked(mockModel.findFirst).mockRejectedValue(err)
      await expect(repo.findItem({ where: { id: '1' } })).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
