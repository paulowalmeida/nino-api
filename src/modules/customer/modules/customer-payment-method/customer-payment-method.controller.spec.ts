import { Test, TestingModule } from '@nestjs/testing'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerPaymentMethodController } from './customer-payment-method.controller'
import { CustomerPaymentMethodService } from './customer-payment-method.service'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

describe(CustomerPaymentMethodController.name, () => {
  let controller: CustomerPaymentMethodController

  const mockResponse: CustomerPaymentMethodResponse = {
    id: 'cpm-1',
    customerId: 'customer-1',
    gatewayToken: 'tok_xxx',
    brand: 'Visa',
    lastFour: '4242',
    expiresAt: null,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    method: { name: 'Cartão de Crédito', description: null },
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockService: Pick<
    CustomerPaymentMethodService,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest
      .fn()
      .mockResolvedValue({ data: [mockResponse], pagination: mockMeta }),
    getById: jest.fn().mockResolvedValue(mockResponse),
    create: jest.fn().mockResolvedValue(mockResponse),
    update: jest.fn().mockResolvedValue(mockResponse),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerPaymentMethodController],
      providers: [
        { provide: CustomerPaymentMethodService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<CustomerPaymentMethodController>(
      CustomerPaymentMethodController,
    )
  })

  it('getAll() should return paginated payment methods for customer', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll('customer-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('customer-1', query)
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return a payment method by id', async () => {
    const result = await controller.getById('cpm-1')
    expect(mockService.getById).toHaveBeenCalledWith('cpm-1')
    expect(result).toEqual(mockResponse)
  })

  it('create() should merge customerId into dto', async () => {
    const dto = { methodId: 'method-1', gatewayToken: 'tok_xxx' }
    const result = await controller.create('customer-1', dto)
    expect(mockService.create).toHaveBeenCalledWith({
      ...dto,
      customerId: 'customer-1',
    })
    expect(result).toEqual(mockResponse)
  })

  it('update() should update and return the payment method', async () => {
    const dto = { isDefault: true }
    const result = await controller.update('cpm-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('cpm-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('cpm-1')
    expect(mockService.delete).toHaveBeenCalledWith('cpm-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
