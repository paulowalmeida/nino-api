import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory } from '@prisma/client'

import { CompanyBusinessCategoryRepository } from './company-business-category.repository'
import { CompanyBusinessCategoryService } from './company-business-category.service'
import { CompanyBusinessCategoryWithCategory } from './types/company-business-category-with-category.type'

describe(CompanyBusinessCategoryService.name, () => {
  let service: CompanyBusinessCategoryService

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

  const getByCompanyId = jest.fn()
  const create = jest.fn()
  const deleteFn = jest.fn()
  const activate = jest.fn()
  const deactivate = jest.fn()

  const mockRepo: Pick<
    CompanyBusinessCategoryRepository,
    'getByCompanyId' | 'create' | 'delete' | 'activate' | 'deactivate'
  > = { getByCompanyId, create, delete: deleteFn, activate, deactivate }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyBusinessCategoryService,
        { provide: CompanyBusinessCategoryRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CompanyBusinessCategoryService>(
      CompanyBusinessCategoryService,
    )
  })

  afterEach(() => jest.clearAllMocks())

  describe('getByCompanyId()', () => {
    it('should delegate to repo and return result', async () => {
      getByCompanyId.mockResolvedValue([mockLink])
      expect(await service.getByCompanyId('company-1')).toEqual([mockLink])
      expect(getByCompanyId).toHaveBeenCalledWith('company-1')
    })
  })

  describe('link()', () => {
    it('should call repo.create with dto and return result', async () => {
      create.mockResolvedValue(mockLink)
      expect(await service.link('company-1', 'cat-1')).toEqual(mockLink)
      expect(create).toHaveBeenCalledWith('company-1', {
        businessCategoryId: 'cat-1',
      })
    })
  })

  describe('unlink()', () => {
    it('should delegate to repo.delete and return message', async () => {
      const message = { message: 'Company Business Category unlinked successfully' }
      deleteFn.mockResolvedValue(message)
      expect(await service.unlink('company-1', 'cat-1')).toEqual(message)
      expect(deleteFn).toHaveBeenCalledWith('company-1', 'cat-1')
    })
  })

  describe('activate()', () => {
    it('should delegate to repo.activate and return result', async () => {
      const activated = { ...mockLink, isActive: true }
      activate.mockResolvedValue(activated)
      expect(await service.activate('company-1', 'cat-1')).toEqual(activated)
      expect(activate).toHaveBeenCalledWith('company-1', 'cat-1')
    })
  })

  describe('deactivate()', () => {
    it('should delegate to repo.deactivate and return result', async () => {
      const deactivated = { ...mockLink, isActive: false }
      deactivate.mockResolvedValue(deactivated)
      expect(await service.deactivate('company-1', 'cat-1')).toEqual(deactivated)
      expect(deactivate).toHaveBeenCalledWith('company-1', 'cat-1')
    })
  })
})
