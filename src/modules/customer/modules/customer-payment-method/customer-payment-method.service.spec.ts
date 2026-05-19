import { Test, TestingModule } from '@nestjs/testing'

import { CustomerPaymentMethodRepository } from './customer-payment-method.repository'
import { CustomerPaymentMethodService } from './customer-payment-method.service'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

describe(CustomerPaymentMethodService.name, () => {
  let service: CustomerPaymentMethodService

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

  const mockRepo: Pick<
    CustomerPaymentMethodRepository,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockResponse]),
    getById: jest.fn().mockResolvedValue(mockResponse),
    create: jest.fn().mockResolvedValue(mockResponse),
    update: jest.fn().mockResolvedValue(mockResponse),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPaymentMethodService,
        { provide: CustomerPaymentMethodRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CustomerPaymentMethodService>(
      CustomerPaymentMethodService,
    )
  })

  it('getAll() should delegate to repository', async () => {
    const result = await service.getAll('customer-1')
    expect(mockRepo.getAll).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual([mockResponse])
  })

  it('getById() should delegate to repository', async () => {
    const result = await service.getById('cpm-1')
    expect(mockRepo.getById).toHaveBeenCalledWith('cpm-1')
    expect(result).toEqual(mockResponse)
  })

  it('create() should delegate to repository', async () => {
    const dto = { methodId: 'method-1', gatewayToken: 'tok_xxx' }
    const result = await service.create('customer-1', dto)
    expect(mockRepo.create).toHaveBeenCalledWith('customer-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('update() should delegate to repository', async () => {
    const dto = { isDefault: true }
    const result = await service.update('cpm-1', dto)
    expect(mockRepo.update).toHaveBeenCalledWith('cpm-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('cpm-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('cpm-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
