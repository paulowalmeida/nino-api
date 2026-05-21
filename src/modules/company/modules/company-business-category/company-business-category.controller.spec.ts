import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory } from '@prisma/client'

import { CompanyBusinessCategoryController } from './company-business-category.controller'
import { CompanyBusinessCategoryService } from './company-business-category.service'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { CompanyBusinessCategoryWithCategory } from './types/company-business-category-with-category.type'

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
    'getByCompanyId' | 'link' | 'unlink' | 'setActive'
  > = {
    getByCompanyId: jest.fn(),
    link: jest.fn(),
    unlink: jest.fn(),
    setActive: jest.fn(),
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

  it('getByCompanyId() should return paginated links', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 20 }
    const paginated = { data: [mockLink], pagination: {} }
    ;(mockService.getByCompanyId as jest.Mock).mockResolvedValue(paginated)
    const result = await controller.getByCompanyId('company-1', query)
    expect(result).toEqual(paginated)
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

  it('activate() should call service.setActive with true', async () => {
    ;(mockService.setActive as jest.Mock).mockResolvedValue({
      ...mockLink,
      isActive: true,
    })
    const result = await controller.activate('company-1', 'cat-1')
    expect(mockService.setActive).toHaveBeenCalledWith(
      'company-1',
      'cat-1',
      true,
    )
    expect(result.isActive).toBe(true)
  })

  it('deactivate() should call service.setActive with false', async () => {
    ;(mockService.setActive as jest.Mock).mockResolvedValue({
      ...mockLink,
      isActive: false,
    })
    const result = await controller.deactivate('company-1', 'cat-1')
    expect(mockService.setActive).toHaveBeenCalledWith(
      'company-1',
      'cat-1',
      false,
    )
    expect(result.isActive).toBe(false)
  })
})
