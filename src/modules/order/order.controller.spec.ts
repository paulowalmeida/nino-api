import { Test, TestingModule } from '@nestjs/testing'

import { Order } from '@prisma/client'

import { TenantRole } from '@shared/enums/tenant-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateOrderDto } from './dtos/create-order.dto'
import { QueryOrderDto } from './dtos/query-order.dto'
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { OrderResponse } from './types/order-response.type'

describe(OrderController.name, () => {
  let controller: OrderController

  const now = new Date()
  const price = 10 as unknown as Order['subtotal']

  const mockResponse: OrderResponse = {
    id: 'order-1',
    tenantId: 'tenant-1',
    customerId: 'customer-1',
    courierId: null,
    deliveryAddressId: null,
    isDelivery: true,
    notes: null,
    subtotal: price,
    deliveryFee: price,
    totalAmount: price,
    guestName: null,
    guestPhone: null,
    guestEmail: null,
    guestCpf: null,
    guestZipCode: null,
    guestStreet: null,
    guestNumber: null,
    guestComplement: null,
    guestNeighborhood: null,
    guestCity: null,
    guestState: null,
    loyaltyPointsUsed: 0,
    loyaltyDiscount: price,
    estimatedDeliveryAt: null,
    createdAt: now,
    updatedAt: now,
    status: {
      id: 'status-1',
      name: 'PENDING',
      description: null,
      createdAt: now,
      updatedAt: now,
    },
    items: [],
    statusHistory: [],
  }

  const mockService: Pick<
    OrderService,
    'getAll' | 'getById' | 'create' | 'updateStatus'
  > = {
    getAll: jest.fn().mockResolvedValue({
      data: [mockResponse],
      pagination: {
        page: 1,
        size: 10,
        total: 1,
        totalPages: 1,
        previousPage: null,
        nextPage: null,
      },
    }),
    getById: jest.fn().mockResolvedValue(mockResponse),
    create: jest.fn().mockResolvedValue(mockResponse),
    updateStatus: jest.fn().mockResolvedValue(mockResponse),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<OrderController>(OrderController)
  })

  it('create() should create an order', async () => {
    const dto: CreateOrderDto = {
      tenantId: 'tenant-1',
      statusId: 'status-1',
      isDelivery: true,
      deliveryFee: 5,
      items: [{ productId: 'product-1', quantity: 1, unitPrice: 10 }],
    }
    const req = { user: { role: TenantRole.OWNER, sub: 'user-1' } } as any
    const result = await controller.create(req, dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponse)
  })

  it('getAll() should return paginated orders', async () => {
    const query: QueryOrderDto = { page: 1, size: 10 }
    const result = await controller.getAll(query)
    expect(mockService.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination.total).toBe(1)
  })

  it('getById() should return an order by id', async () => {
    const result = await controller.getById('order-1')
    expect(mockService.getById).toHaveBeenCalledWith('order-1')
    expect(result).toEqual(mockResponse)
  })

  it('updateStatus() should update the order status', async () => {
    const dto: UpdateOrderStatusDto = { statusId: 'status-2' }
    const result = await controller.updateStatus('order-1', dto)
    expect(mockService.updateStatus).toHaveBeenCalledWith('order-1', dto)
    expect(result).toEqual(mockResponse)
  })
})
