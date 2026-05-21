import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CommonService } from '@shared/modules/common/common.service'
import { CommonEntity } from '@shared/modules/common/types/common-entity.type'
import { PaginationMeta } from '@shared/types/pagination-meta.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { PaymentMethodController } from './payment-method.controller'

describe(PaymentMethodController.name, () => {
  let controller: PaymentMethodController

  const mockPaymentMethod: CommonEntity = {
    id: 'pm-1',
    name: 'Cartão de Crédito',
    description: null,
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

  const mockPaginated: PaginatedResponse<CommonEntity> = {
    data: [mockPaymentMethod],
    pagination: mockMeta,
  }

  const mockService: Pick<
    CommonService,
    'getAllPaginated' | 'getByField' | 'create' | 'update' | 'delete'
  > = {
    getAllPaginated: jest.fn().mockResolvedValue(mockPaginated),
    getByField: jest.fn().mockResolvedValue(mockPaymentMethod),
    create: jest.fn().mockResolvedValue(mockPaymentMethod),
    update: jest.fn().mockResolvedValue(mockPaymentMethod),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodController],
      providers: [{ provide: CommonService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<PaymentMethodController>(PaymentMethodController)
  })

  it('getAll() should call getAllPaginated with query params', async () => {
    const query = { page: 1, size: 10 }
    const result = await controller.getAll(query)
    expect(mockService.getAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      order: undefined,
    })
    expect(result).toEqual(mockPaginated)
  })

  it('getAll() should build order when target is provided', async () => {
    await controller.getAll({ target: 'name', direction: 'asc' })
    expect(mockService.getAllPaginated).toHaveBeenCalledWith({
      page: undefined,
      size: undefined,
      order: { target: 'name', direction: 'asc' },
    })
  })

  it('getById() should return a payment method by id', async () => {
    const result = await controller.getById('pm-1')
    expect(mockService.getByField).toHaveBeenCalledWith('id', 'pm-1')
    expect(result).toEqual(mockPaymentMethod)
  })

  it('create() should create a payment method', async () => {
    const dto = { name: 'Cartão de Crédito' }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockPaymentMethod)
  })

  it('update() should update a payment method', async () => {
    const dto = { description: 'Visa/MC' }
    const result = await controller.update('pm-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('pm-1', dto)
    expect(result).toEqual(mockPaymentMethod)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('pm-1')
    expect(mockService.delete).toHaveBeenCalledWith('pm-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
