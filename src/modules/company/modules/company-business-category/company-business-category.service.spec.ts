import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory } from '@prisma/client'

import {
  CompanyBusinessCategoryRepository,
  CompanyBusinessCategoryWithCategory,
} from './company-business-category.repository'
import { CompanyBusinessCategoryService } from './company-business-category.service'

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

  const mockRepo: Pick<
    CompanyBusinessCategoryRepository,
    'getByCompanyId' | 'create' | 'delete' | 'activate' | 'deactivate'
  > = {
    getByCompanyId: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyBusinessCategoryService,
        {
          provide: CompanyBusinessCategoryRepository,
          useValue: mockRepo,
        },
      ],
    }).compile()

    service = module.get<CompanyBusinessCategoryService>(
      CompanyBusinessCategoryService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getByCompanyId() should return array with categories', async () => {
    ;(mockRepo.getByCompanyId as jest.Mock).mockResolvedValue([mockLink])
    const result = await service.getByCompanyId('company-1')
    expect(result).toEqual([mockLink])
  })

  it('link() should return link with category', async () => {
    ;(mockRepo.create as jest.Mock).mockResolvedValue(mockLink)
    const result = await service.link('company-1', 'cat-1')
    expect(result).toEqual(mockLink)
  })

  it('unlink() should return success message', async () => {
    ;(mockRepo.delete as jest.Mock).mockResolvedValue({
      message: 'Company Business Category unlinked successfully',
    })
    const result = await service.unlink('company-1', 'cat-1')
    expect(result).toEqual({
      message: 'Company Business Category unlinked successfully',
    })
  })

  it('activate() should return link with isActive true', async () => {
    ;(mockRepo.activate as jest.Mock).mockResolvedValue({
      ...mockLink,
      isActive: true,
    })
    const result = await service.activate('company-1', 'cat-1')
    expect(result.isActive).toBe(true)
  })

  it('deactivate() should return link with isActive false', async () => {
    ;(mockRepo.deactivate as jest.Mock).mockResolvedValue({
      ...mockLink,
      isActive: false,
    })
    const result = await service.deactivate('company-1', 'cat-1')
    expect(result.isActive).toBe(false)
  })
})
