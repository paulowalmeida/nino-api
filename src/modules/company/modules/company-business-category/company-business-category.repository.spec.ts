import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { BusinessCategory, CompanyBusinessCategory } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import {
  CompanyBusinessCategoryRepository,
  CompanyBusinessCategoryWithCategory,
} from './company-business-category.repository'

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

  const mockJunction: CompanyBusinessCategory = {
    businessCategoryId: 'cat-1',
    companyId: 'company-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    companyBusinessCategory: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService = { handle: jest.fn() }

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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('getByCompanyId() should return array with categories', async () => {
    mockPrisma.companyBusinessCategory.findMany.mockResolvedValue([mockLink])
    const result = await repository.getByCompanyId('company-1')
    expect(result).toEqual([mockLink])
  })

  it('getByCompanyId() should call errorService.handle on error', async () => {
    const error = new Error('DB error')
    mockPrisma.companyBusinessCategory.findMany.mockRejectedValue(error)
    await repository.getByCompanyId('company-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('link() should create and return link with category', async () => {
    mockPrisma.companyBusinessCategory.create.mockResolvedValue(mockLink)
    const result = await repository.create('company-1', 'cat-1')
    expect(result).toEqual(mockLink)
  })

  it('link() should call errorService.handle on prisma error', async () => {
    const error = new Error('db error')
    mockPrisma.companyBusinessCategory.create.mockRejectedValue(error)
    await repository.create('company-1', 'cat-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('delete() should soft delete and return message', async () => {
    mockPrisma.companyBusinessCategory.findFirst.mockResolvedValue(mockJunction)
    mockPrisma.companyBusinessCategory.update.mockResolvedValue(undefined)
    const result = await repository.delete('company-1', 'cat-1')
    expect(result).toEqual({
      message: 'Company Business Category unlinked successfully',
    })
  })

  it('delete() should call errorService.handle with NotFoundException when not found', async () => {
    mockPrisma.companyBusinessCategory.findFirst.mockResolvedValue(null)
    await repository.delete('company-1', 'cat-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('delete() should call errorService.handle when prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.companyBusinessCategory.findFirst.mockResolvedValue(mockJunction)
    mockPrisma.companyBusinessCategory.update.mockRejectedValue(error)
    await repository.delete('company-1', 'cat-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('activate() should set isActive true and return link', async () => {
    mockPrisma.companyBusinessCategory.update.mockResolvedValue({
      ...mockLink,
      isActive: true,
    })
    const result = await repository.activate('company-1', 'cat-1')
    expect(result.isActive).toBe(true)
  })

  it('activate() should call errorService.handle on error', async () => {
    const error = new Error('db error')
    mockPrisma.companyBusinessCategory.update.mockRejectedValue(error)
    await repository.activate('company-1', 'cat-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('deactivate() should set isActive false and return link', async () => {
    mockPrisma.companyBusinessCategory.update.mockResolvedValue({
      ...mockLink,
      isActive: false,
    })
    const result = await repository.deactivate('company-1', 'cat-1')
    expect(result.isActive).toBe(false)
  })

  it('deactivate() should call errorService.handle on error', async () => {
    const error = new Error('db error')
    mockPrisma.companyBusinessCategory.update.mockRejectedValue(error)
    await repository.deactivate('company-1', 'cat-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
