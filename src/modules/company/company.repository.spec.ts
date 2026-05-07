import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyRepository } from './company.repository'

describe(CompanyRepository.name, () => {
  let repository: CompanyRepository

  const mockCompany = {
    id: 'uuid-1',
    name: 'Acme Corp',
    cnpj: '12345678000190',
    legalName: null,
    stateRegistration: null,
    legalNature: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    company: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<CompanyRepository>(CompanyRepository)
    mockPrisma.company.count.mockResolvedValue(0)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return paginated companies', async () => {
    mockPrisma.company.findMany.mockResolvedValue([mockCompany])
    mockPrisma.company.count.mockResolvedValue(1)
    const result = await repository.getAll({ page: 1, size: 20 })
    expect(result.data).toEqual([mockCompany])
    expect(result.pagination).toMatchObject({
      page: 1,
      size: 20,
      total: 1,
      totalPages: 1,
    })
  })

  it('should call errorService.handle on error in getAll', async () => {
    const error = new Error('DB error')
    mockPrisma.company.findMany.mockRejectedValue(error)
    await repository.getAll({})
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should return company by id', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    const result = await repository.getById('uuid-1')
    expect(result).toEqual(mockCompany)
  })

  it('should call errorService.handle with NotFoundException when not found by id', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(null)
    await repository.getById('invalid-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should return company by cnpj', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    const result = await repository.getByCnpj('12345678000190')
    expect(result).toEqual(mockCompany)
  })

  it('should call errorService.handle with NotFoundException when not found by cnpj', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(null)
    await repository.getByCnpj('invalid-cnpj')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should create a new company', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(null)
    mockPrisma.company.create.mockResolvedValue(mockCompany)
    const result = await repository.create({
      name: 'New Corp',
      cnpj: '98765432000100',
    } as any)
    expect(result).toEqual(mockCompany)
  })

  it('should call errorService.handle with ConflictException when CNPJ already exists', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    await repository.create({
      name: 'New Corp',
      cnpj: '12345678000190',
    } as any)
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
    expect(mockPrisma.company.create).not.toHaveBeenCalled()
  })

  it('should update company', async () => {
    const updated = { ...mockCompany, name: 'Updated Corp' }
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    mockPrisma.company.update.mockResolvedValue(updated)
    const result = await repository.update('uuid-1', {
      name: 'Updated Corp',
    })
    expect(result).toEqual(updated)
  })

  it('should soft delete company and return message', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    mockPrisma.company.update.mockResolvedValue({
      ...mockCompany,
      deletedAt: new Date(),
    })
    const result = await repository.delete('uuid-1')
    expect(result).toEqual({ message: 'Company deleted successfully' })
  })

  it('should activate company', async () => {
    const activated = { ...mockCompany, isActive: true }
    mockPrisma.company.findFirst.mockResolvedValue({
      ...mockCompany,
      isActive: false,
    })
    mockPrisma.company.update.mockResolvedValue(activated)
    const result = await repository.activate('uuid-1')
    expect(result.isActive).toBe(true)
  })

  it('should deactivate company', async () => {
    const deactivated = { ...mockCompany, isActive: false }
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    mockPrisma.company.update.mockResolvedValue(deactivated)
    const result = await repository.deactivate('uuid-1')
    expect(result.isActive).toBe(false)
  })

  it('should call errorService.handle with ConflictException when update CNPJ already exists', async () => {
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    await repository.update('uuid-1', { cnpj: '99999999000199' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(ConflictException),
    )
  })

  it('should call errorService.handle when update prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    mockPrisma.company.update.mockRejectedValue(error)
    await repository.update('uuid-1', { name: 'New' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when delete prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    mockPrisma.company.update.mockRejectedValue(error)
    await repository.delete('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when activate prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    mockPrisma.company.update.mockRejectedValue(error)
    await repository.activate('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when deactivate prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.company.findFirst.mockResolvedValue(mockCompany)
    mockPrisma.company.update.mockRejectedValue(error)
    await repository.deactivate('uuid-1')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
