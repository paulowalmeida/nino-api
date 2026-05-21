import { Test, TestingModule } from '@nestjs/testing'

import { CompanyRepository } from './company.repository'
import { CompanyService } from './company.service'
import { CompanyFull } from './types/company-full.type'
import { CompanyPaginatedResponse } from './types/company-paginated-response.type'
import { CompanyResponse } from './types/company-response.type'

describe(CompanyService.name, () => {
  let service: CompanyService

  const mockResponsible = {
    id: 'responsible-1',
    name: 'John Doe',
    cpf: '12345678900',
    email: 'john@example.com',
    phone: '11999999999',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockCompanyFull: CompanyFull = {
    id: 'uuid-1',
    name: 'Acme Corp',
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
    responsible: mockResponsible,
  }

  const mockCompany: CompanyResponse = {
    id: 'uuid-1',
    name: 'Acme Corp',
    cnpj: '12345678000190',
    legalName: null,
    legalNature: null,
    stateRegistration: null,
    zipCode: null,
    street: null,
    number: null,
    complement: null,
    neighborhood: null,
    city: null,
    state: null,
    country: 'BR',
    isActive: true,
    createdAt: mockCompanyFull.createdAt,
    updatedAt: mockCompanyFull.updatedAt,
    deletedAt: null,
    responsible: mockResponsible,
  }

  const mockPaginated: CompanyPaginatedResponse = {
    data: [mockCompany],
    pagination: {
      page: 1,
      size: 20,
      total: 1,
      totalPages: 1,
      previousPage: null,
      nextPage: null,
    },
  }

  const include = { responsible: true }

  const mockRepo: Pick<
    CompanyRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    findItem: jest.fn(),
    insert: jest.fn(),
    updateItem: jest.fn(),
    softDelete: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: CompanyRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CompanyService>(CompanyService)
  })

  it('getAll() should call findAllPaginated with include and return mapped response', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockCompanyFull],
      pagination: mockPaginated.pagination,
    })
    const result = await service.getAll({ page: 1, size: 20 })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      order: { target: 'name', direction: 'asc' },
      include,
    })
    expect(result).toEqual(mockPaginated)
  })

  it('getById() should call findItem with include and return mapped response', async () => {
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue(mockCompanyFull)
    const result = await service.getById('uuid-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      include,
    })
    expect(result).toEqual(mockCompany)
  })

  it('getByField() should call findItem with field and include', async () => {
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue(mockCompanyFull)
    const result = await service.getByField('cnpj', '12345678000190')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { cnpj: '12345678000190' },
      include,
    })
    expect(result).toEqual(mockCompany)
  })

  it('create() should call insert with include and return mapped response', async () => {
    ;(mockRepo.insert as jest.Mock).mockResolvedValue(mockCompanyFull)
    const dto = {
      name: 'Acme Corp',
      cnpj: '12345678000190',
      ownerId: 'owner-1',
      responsibleId: 'responsible-1',
    }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto, include })
    expect(result).toEqual(mockCompany)
  })

  it('update() should call updateItem then getById and return mapped response', async () => {
    ;(mockRepo.updateItem as jest.Mock).mockResolvedValue(mockCompanyFull)
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue(mockCompanyFull)
    const result = await service.update('uuid-1', { name: 'Updated Corp' })
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { name: 'Updated Corp' },
    })
    expect(result).toEqual(mockCompany)
  })

  it('delete() should call softDelete with id', async () => {
    ;(mockRepo.softDelete as jest.Mock).mockResolvedValue({
      message: 'Deleted successfully',
    })
    const result = await service.delete('uuid-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'uuid-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })

  it('setActive() should call updateItem then getById with isActive true', async () => {
    ;(mockRepo.updateItem as jest.Mock).mockResolvedValue(mockCompanyFull)
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue({
      ...mockCompanyFull,
      isActive: true,
    })
    const result = await service.setActive('uuid-1', true)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { isActive: true },
    })
    expect(result.isActive).toBe(true)
  })

  it('setActive() should call updateItem with isActive false', async () => {
    ;(mockRepo.updateItem as jest.Mock).mockResolvedValue(mockCompanyFull)
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue({
      ...mockCompanyFull,
      isActive: false,
    })
    await service.setActive('uuid-1', false)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { isActive: false },
    })
  })
})
