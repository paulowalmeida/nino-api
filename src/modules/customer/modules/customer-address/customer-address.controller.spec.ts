import { Test, TestingModule } from '@nestjs/testing'

import { CustomerAddress } from '@prisma/client'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerAddressController } from './customer-address.controller'
import { CustomerAddressService } from './customer-address.service'

describe(CustomerAddressController.name, () => {
  let controller: CustomerAddressController

  const mockAddress: CustomerAddress = {
    id: 'address-1',
    customerId: 'customer-1',
    zipCode: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: null,
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    isPrimary: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockPaginated: PaginatedResponse<CustomerAddress> = {
    data: [mockAddress],
    pagination: mockMeta,
  }

  const mockService: Pick<
    CustomerAddressService,
    'getAll' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue(mockPaginated),
    create: jest.fn().mockResolvedValue(mockAddress),
    update: jest.fn().mockResolvedValue(mockAddress),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerAddressController],
      providers: [{ provide: CustomerAddressService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<CustomerAddressController>(
      CustomerAddressController,
    )
  })

  it('getAll() should return paginated addresses for a customer', async () => {
    const query = { page: 1, size: 10 }
    const result = await controller.getAll('customer-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('customer-1', query)
    expect(result).toEqual(mockPaginated)
  })

  it('create() should inject customerId from param', async () => {
    const dto = {
      zipCode: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      customerId: 'customer-1',
    }
    const result = await controller.create('customer-1', dto)
    expect(mockService.create).toHaveBeenCalledWith({
      ...dto,
      customerId: 'customer-1',
    })
    expect(result).toEqual(mockAddress)
  })

  it('update() should update and return address', async () => {
    const dto = { complement: 'Apto 42' }
    const result = await controller.update('address-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('address-1', dto)
    expect(result).toEqual(mockAddress)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('address-1')
    expect(mockService.delete).toHaveBeenCalledWith('address-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
