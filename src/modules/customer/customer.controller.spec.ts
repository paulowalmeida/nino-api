import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerController } from './customer.controller'
import { CustomerOwnerGuard } from './guards/customer-owner.guard'
import { CustomerService } from './customer.service'
import { CustomerPaginatedResponse } from './types/customer-paginated-response.type'
import { CustomerResponse } from './types/customer-response.type'

describe(CustomerController.name, () => {
  let controller: CustomerController

  const mockResponse: CustomerResponse = {
    id: 'customer-1',
    cpf: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { name: 'João', phone: '11999999999' },
  }

  const mockPaginated: CustomerPaginatedResponse = {
    data: [mockResponse],
    pagination: { total: 1, page: 1, size: 10, pages: 1 },
  }

  const mockService: Pick<
    CustomerService,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue(mockPaginated),
    getById: jest.fn().mockResolvedValue(mockResponse),
    create: jest.fn().mockResolvedValue(mockResponse),
    update: jest.fn().mockResolvedValue(mockResponse),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [{ provide: CustomerService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<CustomerController>(CustomerController)
  })

  it('create() should create a customer', async () => {
    const dto = { userId: 'user-1' }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponse)
  })

  it('getAll() should return paginated customers', async () => {
    const query = { page: 1, size: 10 }
    const result = await controller.getAll(query)
    expect(mockService.getAll).toHaveBeenCalledWith(query)
    expect(result).toEqual(mockPaginated)
  })

  it('getById() should return a customer by id', async () => {
    const result = await controller.getById('customer-1')
    expect(mockService.getById).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual(mockResponse)
  })

  it('update() should update and return the customer', async () => {
    const dto = { cpf: '12345678900' }
    const result = await controller.update('customer-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('customer-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('customer-1')
    expect(mockService.delete).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
