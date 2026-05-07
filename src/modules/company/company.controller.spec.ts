import { Test, TestingModule } from '@nestjs/testing'

import { CompanyController } from './company.controller'
import { CompanyService } from './company.service'

describe(CompanyController.name, () => {
  let controller: CompanyController
  let service: CompanyService

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
  }

  const mockService = {
    getAll: jest
      .fn()
      .mockResolvedValue({
        data: [mockCompany],
        pagination: {
          page: 1,
          size: 20,
          total: 1,
          totalPages: 1,
          previousPage: null,
          nextPage: null,
        },
      }),
    getById: jest.fn(),
    getByCnpj: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useValue: mockService }],
    }).compile()

    controller = module.get<CompanyController>(CompanyController)
    service = module.get<CompanyService>(CompanyService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return paginated companies', async () => {
    const query = { page: 1, size: 20 }

    const result = await controller.getAll(query as any)

    expect(result.data).toEqual([mockCompany])
    expect(service.getAll).toHaveBeenCalledWith(query)
  })

  it('should return company by id', async () => {
    mockService.getById.mockResolvedValue(mockCompany)

    const result = await controller.getById('uuid-1')

    expect(result).toEqual(mockCompany)
    expect(service.getById).toHaveBeenCalledWith('uuid-1')
  })

  it('should return company by cnpj', async () => {
    mockService.getByCnpj.mockResolvedValue(mockCompany)

    const result = await controller.getByCnpj('12345678000190')

    expect(result).toEqual(mockCompany)
    expect(service.getByCnpj).toHaveBeenCalledWith('12345678000190')
  })

  it('should create a new company', async () => {
    const createData = { name: 'New Corp', cnpj: '98765432000100' }
    mockService.create.mockResolvedValue({ ...mockCompany, ...createData })

    const result = await controller.create(createData as any)

    expect(result.name).toBe('New Corp')
    expect(service.create).toHaveBeenCalledWith(createData)
  })

  it('should update company', async () => {
    const updateData = { name: 'Updated Corp' }
    mockService.update.mockResolvedValue({ ...mockCompany, ...updateData })

    const result = await controller.update('uuid-1', updateData as any)

    expect(result.name).toBe('Updated Corp')
    expect(service.update).toHaveBeenCalledWith('uuid-1', updateData)
  })

  it('should delete company', async () => {
    mockService.delete.mockResolvedValue({
      message: 'Company deleted successfully',
    })

    const result = await controller.delete('uuid-1')

    expect(result).toEqual({ message: 'Company deleted successfully' })
    expect(service.delete).toHaveBeenCalledWith('uuid-1')
  })

  it('should activate company', async () => {
    const activated = { ...mockCompany, isActive: true }
    mockService.activate.mockResolvedValue(activated)

    const result = await controller.activate('uuid-1')

    expect(result.isActive).toBe(true)
    expect(service.activate).toHaveBeenCalledWith('uuid-1')
  })

  it('should deactivate company', async () => {
    const deactivated = { ...mockCompany, isActive: false }
    mockService.deactivate.mockResolvedValue(deactivated)

    const result = await controller.deactivate('uuid-1')

    expect(result.isActive).toBe(false)
    expect(service.deactivate).toHaveBeenCalledWith('uuid-1')
  })
})
