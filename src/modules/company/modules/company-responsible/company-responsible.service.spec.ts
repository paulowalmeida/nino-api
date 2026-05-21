import { Test, TestingModule } from '@nestjs/testing'

import { Company } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleService } from './company-responsible.service'
import { CompanyResponsibleWithCompanies } from './types/company-responsible-with-companies.type'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

describe(CompanyResponsibleService.name, () => {
  let service: CompanyResponsibleService

  const mockCompany: Company = {
    id: 'company-1',
    name: 'Acme',
    cnpj: '12345678000190',
    legalName: null,
    legalNature: null,
    stateRegistration: null,
    ownerId: 'owner-1',
    responsibleId: 'responsible-1',
    zipCode: null,
    street: null,
    number: null,
    complement: null,
    neighborhood: null,
    city: null,
    state: null,
    country: 'BR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockRaw: CompanyResponsibleWithCompanies = {
    id: 'uuid-1',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    companies: [mockCompany],
  }

  const mockResponse: CompanyResponsibleResponse = {
    id: 'uuid-1',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: mockRaw.createdAt,
    updatedAt: mockRaw.updatedAt,
    companies: [mockCompany],
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const include = { companies: true }

  const mockRepo: Pick<
    CompanyResponsibleRepository,
    | 'findAllPaginated'
    | 'findItem'
    | 'exists'
    | 'insert'
    | 'updateItem'
    | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    findItem: jest.fn(),
    exists: jest.fn(),
    insert: jest.fn(),
    updateItem: jest.fn(),
    softDelete: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyResponsibleService,
        { provide: CompanyResponsibleRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CompanyResponsibleService>(CompanyResponsibleService)
  })

  it('getAll() should return paginated responsibles without deletedAt', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockRaw],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll(query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      order: { target: 'name', direction: 'asc' },
      include,
    })
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getByField() should return responsible by field', async () => {
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue(mockRaw)
    const result = await service.getByField('id', 'uuid-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('create() should return existing when CPF already exists', async () => {
    ;(mockRepo.exists as jest.Mock).mockResolvedValue(true)
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue(mockRaw)
    const dto = {
      name: 'John Doe',
      cpf: '12345678900',
      email: 'john@example.com',
      phone: '11999999999',
    }
    const result = await service.create(dto)
    expect(mockRepo.exists).toHaveBeenCalledWith({
      where: { cpf: '12345678900' },
    })
    expect(mockRepo.insert).not.toHaveBeenCalled()
    expect(result).toEqual(mockResponse)
  })

  it('create() should insert when CPF does not exist', async () => {
    ;(mockRepo.exists as jest.Mock).mockResolvedValue(false)
    ;(mockRepo.insert as jest.Mock).mockResolvedValue(mockRaw)
    const dto = {
      name: 'John Doe',
      cpf: '12345678900',
      email: 'john@example.com',
      phone: '11999999999',
    }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto, include })
    expect(result).toEqual(mockResponse)
  })

  it('update() should return updated responsible without deletedAt', async () => {
    ;(mockRepo.updateItem as jest.Mock).mockResolvedValue(mockRaw)
    const result = await service.update('uuid-1', { name: 'Jane Doe' })
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { name: 'Jane Doe' },
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('delete() should return success message', async () => {
    const message = { message: 'Deleted successfully' }
    ;(mockRepo.softDelete as jest.Mock).mockResolvedValue(message)
    const result = await service.delete('uuid-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'uuid-1' })
    expect(result).toEqual(message)
  })
})
