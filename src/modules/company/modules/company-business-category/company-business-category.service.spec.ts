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

  const include = { businessCategory: true }

  const mockRepo: Pick<
    CompanyBusinessCategoryRepository,
    'findAllPaginated' | 'insert' | 'softDelete' | 'updateItem'
  > = {
    findAllPaginated: jest.fn(),
    insert: jest.fn(),
    softDelete: jest.fn(),
    updateItem: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
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

  it('getByCompanyId() should call findAllPaginated with where and include', async () => {
    const paginated = { data: [mockLink], pagination: {} }
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue(paginated)
    const result = await service.getByCompanyId('company-1', {
      page: 1,
      size: 20,
    })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { companyId: 'company-1' },
      include,
      page: 1,
      size: 20,
    })
    expect(result).toEqual(paginated)
  })

  it('link() should call insert with companyId, businessCategoryId and include', async () => {
    ;(mockRepo.insert as jest.Mock).mockResolvedValue(mockLink)
    const result = await service.link('company-1', 'cat-1')
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: { companyId: 'company-1', businessCategoryId: 'cat-1' },
      include,
    })
    expect(result).toEqual(mockLink)
  })

  it('unlink() should call softDelete with composite key', async () => {
    const message = { message: 'Deleted successfully' }
    ;(mockRepo.softDelete as jest.Mock).mockResolvedValue(message)
    const result = await service.unlink('company-1', 'cat-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({
      businessCategoryId_companyId: {
        businessCategoryId: 'cat-1',
        companyId: 'company-1',
      },
    })
    expect(result).toEqual(message)
  })

  it('setActive() should call updateItem with isActive true', async () => {
    ;(mockRepo.updateItem as jest.Mock).mockResolvedValue(mockLink)
    const result = await service.setActive('company-1', 'cat-1', true)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: {
        businessCategoryId_companyId: {
          businessCategoryId: 'cat-1',
          companyId: 'company-1',
        },
      },
      data: { isActive: true },
      include,
    })
    expect(result).toEqual(mockLink)
  })

  it('setActive() should call updateItem with isActive false', async () => {
    ;(mockRepo.updateItem as jest.Mock).mockResolvedValue({
      ...mockLink,
      isActive: false,
    })
    await service.setActive('company-1', 'cat-1', false)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: {
        businessCategoryId_companyId: {
          businessCategoryId: 'cat-1',
          companyId: 'company-1',
        },
      },
      data: { isActive: false },
      include,
    })
  })
})
