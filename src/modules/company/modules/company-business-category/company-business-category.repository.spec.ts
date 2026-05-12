import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory, CompanyBusinessCategory } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyBusinessCategoryRepository } from './company-business-category.repository'
import { CompanyBusinessCategoryWithCategory } from './types/company-business-category-with-category.type'

describe(CompanyBusinessCategoryRepository.name, () => {
  let repository: CompanyBusinessCategoryRepository

  const mockCategory: BusinessCategory = {
    id: 'cat-1',
    name: 'Pizzaria',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockLink: CompanyBusinessCategoryWithCategory = {
    businessCategoryId: 'cat-1',
    companyId: 'company-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    businessCategory: mockCategory,
  }

  const mockDelegate = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }

  const mockPrisma = { companyBusinessCategory: mockDelegate }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => {
      throw e
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyBusinessCategoryRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CompanyBusinessCategoryRepository>(
      CompanyBusinessCategoryRepository,
    )
  })

  afterEach(() => jest.clearAllMocks())

  describe('getByCompanyId()', () => {
    it('should return array with categories', async () => {
      mockDelegate.findMany.mockResolvedValue([mockLink])
      expect(await repository.getByCompanyId('company-1')).toEqual([mockLink])
    })

    it('should throw on db error', async () => {
      mockDelegate.findMany.mockRejectedValue(new Error('db error'))
      await expect(
        repository.getByCompanyId('company-1'),
      ).rejects.toThrow('db error')
    })
  })

  describe('create()', () => {
    it('should create and return link with category', async () => {
      mockDelegate.create.mockResolvedValue(mockLink)
      expect(
        await repository.create('company-1', { businessCategoryId: 'cat-1' }),
      ).toEqual(mockLink)
      expect(mockDelegate.create).toHaveBeenCalledWith({
        data: { businessCategoryId: 'cat-1', companyId: 'company-1' },
        include: { businessCategory: true },
      })
    })

    it('should throw on db error', async () => {
      mockDelegate.create.mockRejectedValue(new Error('db error'))
      await expect(
        repository.create('company-1', { businessCategoryId: 'cat-1' }),
      ).rejects.toThrow('db error')
    })
  })

  describe('delete()', () => {
    it('should soft delete and return message', async () => {
      mockDelegate.update.mockResolvedValue({})
      expect(await repository.delete('company-1', 'cat-1')).toEqual({
        message: 'Company Business Category unlinked successfully',
      })
      expect(mockDelegate.update).toHaveBeenCalledWith({
        where: {
          businessCategoryId_companyId: {
            businessCategoryId: 'cat-1',
            companyId: 'company-1',
          },
        },
        data: { deletedAt: expect.any(Date) },
        include: undefined,
      })
    })

    it('should throw on db error', async () => {
      mockDelegate.update.mockRejectedValue(new Error('db error'))
      await expect(
        repository.delete('company-1', 'cat-1'),
      ).rejects.toThrow('db error')
    })
  })

  describe('activate()', () => {
    it('should set isActive true and return link with category', async () => {
      const activated = { ...mockLink, isActive: true }
      mockDelegate.update.mockResolvedValue(activated)
      expect(await repository.activate('company-1', 'cat-1')).toEqual(activated)
      expect(mockDelegate.update).toHaveBeenCalledWith({
        where: {
          businessCategoryId_companyId: {
            businessCategoryId: 'cat-1',
            companyId: 'company-1',
          },
        },
        data: { isActive: true },
        include: { businessCategory: true },
      })
    })

    it('should throw on db error', async () => {
      mockDelegate.update.mockRejectedValue(new Error('db error'))
      await expect(
        repository.activate('company-1', 'cat-1'),
      ).rejects.toThrow('db error')
    })
  })

  describe('deactivate()', () => {
    it('should set isActive false and return link with category', async () => {
      const deactivated = { ...mockLink, isActive: false }
      mockDelegate.update.mockResolvedValue(deactivated)
      expect(
        await repository.deactivate('company-1', 'cat-1'),
      ).toEqual(deactivated)
      expect(mockDelegate.update).toHaveBeenCalledWith({
        where: {
          businessCategoryId_companyId: {
            businessCategoryId: 'cat-1',
            companyId: 'company-1',
          },
        },
        data: { isActive: false },
        include: { businessCategory: true },
      })
    })

    it('should throw on db error', async () => {
      mockDelegate.update.mockRejectedValue(new Error('db error'))
      await expect(
        repository.deactivate('company-1', 'cat-1'),
      ).rejects.toThrow('db error')
    })
  })
})
