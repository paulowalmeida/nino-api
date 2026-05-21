import { Test, TestingModule } from '@nestjs/testing'

import { CompanyController } from './company.controller'
import { CompanyService } from './company.service'
import { CompanyPaginatedResponse } from './types/company-paginated-response.type'
import { CompanyResponse } from './types/company-response.type'

describe(CompanyController.name, () => {
  let controller: CompanyController

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
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    responsible: {
      id: 'responsible-1',
      name: 'John Doe',
      cpf: '12345678900',
      email: 'john@example.com',
      phone: '11999999999',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
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

  const mockService: Pick<
    CompanyService,
    | 'getAll'
    | 'getById'
    | 'getByField'
    | 'create'
    | 'update'
    | 'delete'
    | 'setActive'
  > = {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByField: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setActive: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useValue: mockService }],
    }).compile()

    controller = module.get<CompanyController>(CompanyController)
  })

  it('getAll() should return paginated companies', async () => {
    ;(mockService.getAll as jest.Mock).mockResolvedValue(mockPaginated)
    const result = await controller.getAll({ page: 1, size: 20 })
    expect(result).toEqual(mockPaginated)
  })

  it('getById() should return company by id', async () => {
    ;(mockService.getById as jest.Mock).mockResolvedValue(mockCompany)
    const result = await controller.getById('uuid-1')
    expect(mockService.getById).toHaveBeenCalledWith('uuid-1')
    expect(result).toEqual(mockCompany)
  })

  it('getByCnpj() should call getByField with cnpj', async () => {
    ;(mockService.getByField as jest.Mock).mockResolvedValue(mockCompany)
    const result = await controller.getByCnpj('12345678000190')
    expect(mockService.getByField).toHaveBeenCalledWith(
      'cnpj',
      '12345678000190',
    )
    expect(result).toEqual(mockCompany)
  })

  it('create() should return created company', async () => {
    ;(mockService.create as jest.Mock).mockResolvedValue(mockCompany)
    const result = await controller.create({
      name: 'Acme Corp',
      cnpj: '12345678000190',
      ownerId: 'owner-1',
      responsibleId: 'responsible-1',
    })
    expect(result).toEqual(mockCompany)
  })

  it('update() should return updated company', async () => {
    const updated = { ...mockCompany, name: 'Updated Corp' }
    ;(mockService.update as jest.Mock).mockResolvedValue(updated)
    const result = await controller.update('uuid-1', { name: 'Updated Corp' })
    expect(result).toEqual(updated)
  })

  it('delete() should return success message', async () => {
    ;(mockService.delete as jest.Mock).mockResolvedValue({
      message: 'Deleted successfully',
    })
    const result = await controller.delete('uuid-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })

  it('activate() should call setActive with true', async () => {
    ;(mockService.setActive as jest.Mock).mockResolvedValue({
      ...mockCompany,
      isActive: true,
    })
    const result = await controller.activate('uuid-1')
    expect(mockService.setActive).toHaveBeenCalledWith('uuid-1', true)
    expect(result.isActive).toBe(true)
  })

  it('deactivate() should call setActive with false', async () => {
    ;(mockService.setActive as jest.Mock).mockResolvedValue({
      ...mockCompany,
      isActive: false,
    })
    const result = await controller.deactivate('uuid-1')
    expect(mockService.setActive).toHaveBeenCalledWith('uuid-1', false)
    expect(result.isActive).toBe(false)
  })
})
