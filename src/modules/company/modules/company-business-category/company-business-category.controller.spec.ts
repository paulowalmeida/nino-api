import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory, CompanyBusinessCategory } from '@prisma/client'

import {
  CompanyBusinessCategoryWithCategory,
} from './company-business-category.repository'
import { CompanyBusinessCategoryController } from './company-business-category.controller'
import { CompanyBusinessCategoryService } from './company-business-category.service'

describe(CompanyBusinessCategoryController.name, () => {
  let controller: CompanyBusinessCategoryController

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

  const mockService: Pick<
    CompanyBusinessCategoryService,
    'getByCompanyId' | 'link' | 'unlink' | 'activate' | 'deactivate'
  > = {
    getByCompanyId: jest.fn(),
    link: jest.fn(),
    unlink: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyBusinessCategoryController],
      providers: [
        { provide: CompanyBusinessCategoryService, useValue: mockService },
      ],
    }).compile()

    controller = module.get<CompanyBusinessCategoryController>(
      CompanyBusinessCategoryController,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getByCompanyId() should return array of links', async () => {
    ;(mockService.getByCompanyId as jest.Mock).mockResolvedValue([mockLink])
    const result = await controller.getByCompanyId('company-1')
    expect(result).toEqual([mockLink])
  })

  it('link() should return created link', async () => {
    ;(mockService.link as jest.Mock).mockResolvedValue(mockLink)
    const result = await controller.link('company-1', {
      businessCategoryId: 'cat-1',
    })
    expect(result).toEqual(mockLink)
  })

  it('unlink() should return success message', async () => {
    ;(mockService.unlink as jest.Mock).mockResolvedValue({
      message: 'Company Business Category unlinked successfully',
    })
    const result = await controller.unlink('company-1', 'cat-1')
    expect(result).toEqual({
      message: 'Company Business Category unlinked successfully',
    })
  })

  it('activate() should return link with isActive true', async () => {
    ;(mockService.activate as jest.Mock).mockResolvedValue({
      ...mockLink,
      isActive: true,
    })
    const result = await controller.activate('company-1', 'cat-1')
    expect(result.isActive).toBe(true)
  })

  it('deactivate() should return link with isActive false', async () => {
    ;(mockService.deactivate as jest.Mock).mockResolvedValue({
      ...mockLink,
      isActive: false,
    })
    const result = await controller.deactivate('company-1', 'cat-1')
    expect(result.isActive).toBe(false)
  })
})
